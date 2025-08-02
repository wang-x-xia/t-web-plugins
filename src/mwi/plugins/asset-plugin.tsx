import * as React from "react";
import {Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";
import {combineLatest} from "rxjs";
import {sum} from "../../shared/list";
import {useLatestOrDefault} from "../../shared/rxjs-react";
import {jsonCopy} from "../../shared/utils";
import {AddView} from "../../shared/view";
import {formatTimestamp} from "../component/date";
import {formatNumber} from "../component/number";
import {ShowStoreActions} from "../component/store";
import {AllLoadedEvent} from "../engine/engine-event";
import {InventoryData$} from "../engine/inventory";
import {getItemCategory, ItemCategory, SpecialItems} from "../engine/item";
import {getSellPriceByHrid, MarketDataStore} from "../engine/market";
import {defineStore} from "../engine/store";


interface AssetData {
    inventoryTime: number,
    marketTime: number,
    coin: number,
    cowbell: {
        tradable: number,
        price: number,
        count: number,
        total: number,
    },
    items: {
        hrid: string,
        category: ItemCategory,
        price: number,
        count: number,
        total: number,
    }[],
    itemTotal: number,
}

function refineTotal(data: AssetData): AssetData {
    data.cowbell.total = data.cowbell.price * data.cowbell.count;
    data.items.forEach(it => it.total = it.price * it.count);
    data.itemTotal = sum(data.items.map(it => it.total));
    return data
}

const AssertStore = defineStore<AssetData[]>({
    id: "assert",
    name: "Assert",
    characterBased: true,
    enableSettings: true,
    defaultValue: [],
})

combineLatest({inventory: InventoryData$, market: MarketDataStore.data$}).subscribe(({inventory, market}) => {
    if (inventory === null) {
        return;
    }
    const inventoryTime = new Date().setMinutes(0, 0, 0);

    const tradableCowbell = (inventory.inventory[SpecialItems.BagOf10CowBells][0] ?? 0) * 10;
    const untradableCowbell = (inventory.inventory[SpecialItems.CowBell][0] ?? 0);
    const cowbellPrice = getSellPriceByHrid(SpecialItems.BagOf10CowBells, 0, market) / 10
    const assetData: AssetData = {
        inventoryTime,
        marketTime: market.timestamp,
        coin: inventory.inventory[SpecialItems.Coin][0] ?? 0,
        cowbell: {
            tradable: tradableCowbell,
            price: cowbellPrice,
            count: untradableCowbell + tradableCowbell,
            total: 0,
        },
        items: Object.entries(inventory.inventory).flatMap(([hrid, leveledCount]) => {
            if (([SpecialItems.Coin, SpecialItems.BagOf10CowBells, SpecialItems.CowBell] as string[]).includes(hrid)) {
                return [];
            }
            const category = getItemCategory(hrid);
            if ([ItemCategory.Unknown, ItemCategory.Equipment, ItemCategory.Currency].includes(category)) {
                return [];
            }
            if (leveledCount[0] === undefined) {
                return [];
            }
            const count = leveledCount[0];
            const price = getSellPriceByHrid(hrid, 0, market);
            return [{
                hrid,
                category,
                price,
                count,
                total: 0,
            }];
        }),
        itemTotal: 0,
    }
    refineTotal(assetData);

    function checkAndApplyNearMarket(assetData: AssetData): AssetData {
        if (Math.abs(assetData.inventoryTime - market.timestamp) >= (Math.abs(assetData.inventoryTime - assetData.marketTime))) {
            return assetData
        }
        // The input market data is nearer than the market data in inventory data
        const result = jsonCopy(assetData);
        result.marketTime = market.timestamp;
        result.cowbell.price = getSellPriceByHrid(SpecialItems.BagOf10CowBells, 0, market) / 10;
        result.items.forEach(it => it.price = getSellPriceByHrid(it.hrid, 0, market));
        refineTotal(result);
        return result
    }

    AssertStore.update((prev) => {
        const result = [
            ...prev.filter(it => it.inventoryTime !== inventoryTime)
                .map(it => checkAndApplyNearMarket(it)),
            assetData,
        ];
        result.sort((a, b) => b.inventoryTime - a.inventoryTime);
        return result
    });
});

export function assetPlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "asset",
                name: "Asset",
                node: <>
                    <ShowStoreActions store={AssertStore}/>
                    <ShowAssert/>
                </>
            });
        },
    });
}


function ShowAssert() {
    const asserts = useLatestOrDefault(AssertStore.data$, []);

    return <>
        <AreaChart width={800} height={400} data={asserts}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="inventoryTime" tickFormatter={it => formatTimestamp(it)}/>
            <YAxis tickFormatter={it => formatNumber(it as number)}/>
            <Tooltip labelFormatter={it => formatTimestamp(it)}
                     formatter={value => formatNumber(value as number)}/>
            <Area name="Items" dataKey="itemTotal" stackId="1" stroke="#63EBB1" fill="#63EBB1"/>
            <Area name="Cowbell" dataKey={it => it.cowbell.total} stackId="1" stroke="#63EBDF" fill="#63EBDF"/>
            <Area name="Coin" dataKey="coin" stackId="1" stroke="#63CAEB" fill="#63CAEB"/>
        </AreaChart>
    </>
}
