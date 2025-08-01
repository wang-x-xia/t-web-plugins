import * as React from "react";
import {Fragment} from "react";
import {sum} from "../../shared/list";
import {useLatestOrDefault, useLatestValue} from "../../shared/rxjs-react";
import {createBoolSetting, updateSetting, useSetting} from "../../shared/settings";
import {AddView} from "../../shared/view";
import {ShowTimestamp} from "../component/date";
import {ShowItem} from "../component/item";
import {ShowNumber} from "../component/number";
import {MarketDataContext, ShowSellAmount, ShowSellPrice} from "../component/price";
import {ShowStoreActions} from "../component/store";
import {AllLoadedEvent} from "../engine/engine-event";
import {InventoryData$} from "../engine/inventory";
import {getItemCategory, ItemCategory, SpecialItems} from "../engine/item";
import {getSellPriceByHrid, type MarketData, MarketDataStore} from "../engine/market";
import {defineStore} from "../engine/store";


const MarketHistoryStore = defineStore<MarketData[]>({
    id: "price-change",
    name: "Market History",
    characterBased: false,
    enableSettings: true,
    defaultValue: [],
})

MarketDataStore.data$.subscribe(data => {
    MarketHistoryStore.update(previous => {
        if (previous.find(it => it.timestamp === data.timestamp)) {
            return previous;
        }
        const result = [...previous, data]
        result.sort((a, b) => b.timestamp - a.timestamp);
        return result;
    });
});

export function priceChangePlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "price-change",
                name: "Price Change",
                node: <>
                    <ShowStoreActions store={MarketHistoryStore}/>
                    <ShowPriceChange/>
                </>
            });
        },
    });
}

const SHOW_OTHERS_SETTING = createBoolSetting(
    "price-change.show-others",
    "Show others",
    false)

export function ShowPriceChange() {
    const history = useLatestOrDefault(MarketHistoryStore.data$, []);
    const inventory = useLatestValue(InventoryData$)
    const showOthers = useSetting(SHOW_OTHERS_SETTING);

    if (inventory === null || history.length === 0) {
        return <>No data</>
    }

    const items: {
        hrid: string,
        count: number,
        price: number,
        subtotal: number
    }[] = Object.entries(inventory.inventory)
        .filter(([hrid, _]) => ![
            // Due to the sell price is not stable
            ItemCategory.Equipment,
            // Due to the currency is special
            ItemCategory.Currency,
            // Ignore unknown first
            ItemCategory.Unknown,
        ].includes(getItemCategory(hrid)))
        .map(([hrid, value]) => {
            const count = value[0] ?? 0
            const price = getSellPriceByHrid(hrid, 0, history[0]);
            return {
                hrid,
                count,
                price,
                subtotal: count * price
            }
        })
        .sort((a, b) => b.subtotal - a.subtotal);

    const coin = inventory.inventory[SpecialItems.Coin]?.[0] ?? 0

    const itemsTotal = sum(items.map(it => it.subtotal))

    const main = items.filter(it => it.subtotal / itemsTotal >= 0.01)
    const others = items.filter(it => it.subtotal / itemsTotal < 0.01)

    return <>
        <div>
            Coin: <ShowNumber value={coin}/>
        </div>
        <table>
            <thead>
            <tr>
                <th rowSpan={2}>Item</th>
                <th rowSpan={2}>Count</th>
                {history.map(({timestamp}) =>
                    <th key={timestamp} colSpan={2}>
                        <ShowTimestamp value={timestamp * 1000}/>
                        <button
                            onClick={() => MarketHistoryStore.update(prev => prev.filter(it => it.timestamp !== timestamp))}>
                            x
                        </button>
                    </th>)}
            </tr>
            <tr>
                {history.map(it =>
                    <Fragment key={it.timestamp}>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </Fragment>
                )}
            </tr>
            </thead>
            <tbody>
            {main.map(({hrid, count}) => <tr key={hrid}>
                <th><ShowItem hrid={hrid}/></th>
                <td><ShowNumber value={count}/></td>
                {history.map(marketData =>
                    <MarketDataContext.Provider key={marketData.timestamp} value={marketData}>
                        <td><ShowSellPrice hrid={hrid}/></td>
                        <td><ShowSellAmount hrid={hrid} count={count}/></td>
                    </MarketDataContext.Provider>)}
            </tr>)}
            {
                showOthers ?
                    others.map(({hrid, count}) => <tr key={hrid}>
                        <th><ShowItem hrid={hrid}/></th>
                        <td><ShowNumber value={count}/></td>
                        {history.map(marketData =>
                            <MarketDataContext.Provider key={marketData.timestamp} value={marketData}>
                                <td><ShowSellPrice hrid={hrid}/></td>
                                <td><ShowSellAmount hrid={hrid} count={count}/></td>
                            </MarketDataContext.Provider>)}
                    </tr>)
                    : <tr>
                        <th colSpan={2}>
                            {"Others(<1%)"}
                            <button onClick={() => updateSetting(SHOW_OTHERS_SETTING, true)}>+</button>
                        </th>
                        {history.map(marketData => <td key={marketData.timestamp} colSpan={2}>
                            <ShowNumber
                                value={sum(others.map(({hrid, count}) =>
                                    getSellPriceByHrid(hrid, 0, marketData) * count))}/>
                        </td>)}
                    </tr>
            }
            </tbody>
            <tfoot>
            <tr>
                <th colSpan={2}>Total
                    {showOthers ? <button onClick={() => updateSetting(SHOW_OTHERS_SETTING, false)}>
                        {"-(<1%)"}
                    </button> : <></>}
                </th>
                {history.map(marketData => <td key={marketData.timestamp} colSpan={2}>
                    <ShowNumber
                        value={sum(items.map(({hrid, count}) => getSellPriceByHrid(hrid, 0, marketData) * count))}/>
                </td>)}
            </tr>
            </tfoot>
        </table>
    </>
}
