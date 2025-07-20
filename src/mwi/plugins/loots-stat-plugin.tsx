import * as React from "react";
import {useMemo} from "react";
import {Area, AreaChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis} from "recharts";
import {sum} from "../../shared/list";
import {log} from "../../shared/log";
import {createNumberSetting, createStringSelectSetting, ShowSettingValue, useSetting} from "../../shared/settings";
import {formatTimestamp, ShowTimestamp} from "../component/date";
import {ShowItem} from "../component/item";
import {formatNumber, formatPercent, ShowNumber} from "../component/number";
import {ShowStoreActions} from "../component/store";
import {getClientData} from "../engine/client";
import {luckyModelFactory} from "../engine/drop-math";
import {AllLoadedEvent, LootOpened$} from "../engine/engine-event";
import {getItemName, getOpenableItemDropTable} from "../engine/item";
import {getSellPriceByHrid} from "../engine/market";
import {defineStore, useStoreData} from "../engine/store";
import {AddView} from "../view";


interface LootOpenData {
    time: number;
    hrid: string;
    count: number;
    items: { hrid: string, count: number }[]
}

const LootsStore = defineStore<LootOpenData[]>({
    id: "loots",
    name: "Loots",
    characterBased: true,
    enableSettings: true,
    defaultValue: [],
});


LootOpened$.subscribe(({openedItem: {itemHrid: hrid, count}, gainedItems}) => {
    const openData = {
        time: Date.now(),
        hrid,
        count,
        items: gainedItems.map(it => ({hrid: it.itemHrid, count: it.count})),
    }
    LootsStore.data$.next([...LootsStore.data$.getValue(), openData]);
})

export function lootsStatsPlugin() {
    AllLoadedEvent.subscribe({
        complete: () => {
            AddView({
                id: "loots",
                name: "Loots",
                node: <>
                    <ShowStoreActions store={LootsStore}/>
                    <ShowLoots/>
                </>
            });
        },
    });
}

export function ShowLoots() {
    const loots = useStoreData(LootsStore);
    const lootHridSetting = useMemo(() => createStringSelectSetting(
        {id: "loot-hrid", name: "Loot Hrid", defaultValue: "",}, [
            {name: "All", value: ""},
            ...Object.keys(getClientData().openableLootDropMap).map(it =>
                ({name: getItemName(it), value: it}))]), [])
    const lootHrid = useSetting(lootHridSetting);
    const filteredLoots = useMemo(() => loots.filter(it => !lootHrid || it.hrid === lootHrid),
        [loots, lootHrid]);

    return <>
        <div>
            Loot Hrid: <ShowSettingValue setting={lootHridSetting}/>
        </div>
        {lootHrid && <ShowLootDrop hrid={lootHrid} loots={filteredLoots}/>}
        <table>
            <thead>
            <tr>
                <th>Time</th>
                <th>Hrid</th>
                <th>Count</th>
                <th>Total</th>
                <th>Gained Items</th>
            </tr>
            </thead>
            <tbody>
            {filteredLoots.map(({count, hrid, time, items}) => <tr key={time}>
                <td><ShowTimestamp value={time}/></td>
                <td><ShowItem hrid={hrid}/></td>
                <td><ShowNumber value={count}/></td>
                <td><ShowNumber value={sum(items.map(it => it.count * getSellPriceByHrid(it.hrid)))}/></td>
                <td>
                    <table>
                        <thead>
                        <tr>
                            <th>Hrid</th>
                            <th>Price</th>
                            <th>Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map(({count: itemCount, hrid: itemHrid}, index) => <tr key={`${index}-${itemHrid}`}>
                            <td><ShowItem hrid={itemHrid}/></td>
                            <td><ShowNumber value={getSellPriceByHrid(itemHrid)}/></td>
                            <td><ShowNumber value={itemCount}/></td>
                        </tr>)}
                        </tbody>
                    </table>
                </td>
            </tr>)}
            </tbody>
        </table>
    </>
}

const LootsCountSetting = createNumberSetting(
    {id: "loots-count", name: "Loots Count", defaultValue: 1,},
    "integer", {min: 1, step: 1});

interface LuckyValue {
    lucky: number,
    total: number,
    outputs: Record<string, { count: number, price: number, total: number }>,
}

export function ShowLootDrop({hrid, loots: inputLoots}: { hrid: string, loots: LootOpenData[] }) {
    const lootsCount = useSetting(LootsCountSetting);
    const {names, drops, points} = useMemo(() => {
        const drops = (getOpenableItemDropTable(hrid) ?? []).map(({itemHrid, dropRate, maxCount, minCount}) => {
            let name = getItemName(itemHrid);
            if (dropRate != 1) {
                name += " " + formatPercent(dropRate);
            }
            return {
                name,
                model: luckyModelFactory(lootsCount, dropRate, minCount, maxCount),
                price: getSellPriceByHrid(itemHrid),
            }
        });
        const names = drops.map(it => it.name);
        const points: LuckyValue[] = [];
        for (let i = 1; i * 0.005 < 1; i++) {
            const lucky = i * 0.005;
            const outputs = Object.fromEntries(drops.map(({name, model, price}) => {
                const count = model.getCountOfLucky(lucky);
                const total = count * price;
                return [name, {count, price, total}];
            }));
            points.push({
                lucky,
                total: sum(Object.values(outputs).map(it => it.total)),
                outputs,
            });
        }
        log("points", points);
        return {names, drops, points};
    }, [hrid, lootsCount]);

    const loots = useMemo(() => inputLoots.filter(it => it.count === lootsCount), [inputLoots, lootsCount]);

    return <>
        <div>
            Loots Count: <ShowSettingValue setting={LootsCountSetting}/>
        </div>
        <AreaChart width={800} height={400} data={points}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="lucky" tickFormatter={it => formatPercent(it)}/>
            <YAxis tickFormatter={it => formatNumber(it as number)}/>
            <Tooltip labelFormatter={it => formatPercent(it)}
                     formatter={value => formatNumber(value as number)}/>
            {names.map((name, index) =>
                <Area key={name} name={name} dataKey={it => it.outputs[name].total}
                      stackId="1" stroke={index % 2 === 0 ? "#63EBB1" : "#63EBDF"}
                      fill={index % 2 === 0 ? "#63EBB1" : "#63EBDF"}/>)}
            {loots.map((loot) =>
                <ShowLineOfLoot key={loot.time} data={loot} points={points}/>)}
        </AreaChart>
    </>
}

export function ShowLineOfLoot({data: {items, time}, points}: { data: LootOpenData, points: LuckyValue[] }) {
    const income = useMemo(() => sum(items.map(({count, hrid}) => count * getSellPriceByHrid(hrid))),
        [items])
    const lucky = points.find(it => it.total >= income)?.lucky ?? 0;
    log("show-line-of-loot", {time, income, lucky});
    return <ReferenceLine x={lucky} stroke="red" strokeDasharray="3 3" label={formatTimestamp(time)}/>;
}