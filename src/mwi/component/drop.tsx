import * as React from "react";
import {createContext, useContext, useEffect, useMemo, useState} from "react";
import {CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis} from "recharts";
import {Expandable, LazyExpandable} from "../../shared/expand";
import {createGroupOpContext, useChildId, useGroupData} from "../../shared/group";
import {sum} from "../../shared/list";
import {combination} from "../../shared/math";
import type {DropInfo} from "../api/action-type";
import type {ItemCount} from "../api/common-type";
import {EmptyBuffData} from "../engine/buff";
import {type AnyBuffType, NormalBuffType} from "../engine/buff-type";
import {getSellPriceByHrid} from "../engine/market";
import {ShowItem} from "./item";
import {formatNumber, ShowNumber, ShowPercent} from "./number";
import {MarketDataContext, ShowSellAmount, ShowSellPrice} from "./price";


export type DropMode = "avg" | "lucky";


const DropIncomeGroupOpContext = createGroupOpContext<number>();

export interface DropConfiguration {
    times: number,
    mode: DropMode,
    lucky: number,
    buffData: Record<AnyBuffType, number>,
}

const DropConfiguration = createContext<DropConfiguration>({
    times: 1,
    mode: "avg",
    lucky: 0.5,
    buffData: EmptyBuffData,
});


export function ShowDropIncome(
    {
        times, mode, lucky, buffData,
        outputItems,
        dropTable,
        essenceDropTable,
        rareDropTable,
        onIncomeChange,
    }: DropConfiguration & {
        outputItems: ItemCount[] | null
        dropTable: DropInfo[] | null
        essenceDropTable: DropInfo[] | null
        rareDropTable: DropInfo[] | null
        onIncomeChange: (income: number) => void
    }) {

    const {data: group, context} = useGroupData({}, 0)
    const income = sum(Object.values(group))
    useEffect(() => {
        onIncomeChange(income);
    }, [income]);
    const dropConfiguration = useMemo(() => ({
        times, mode, lucky, buffData
    }), [times, mode, lucky, buffData])

    return <DropIncomeGroupOpContext.Provider value={context}>
        <DropConfiguration.Provider value={dropConfiguration}>
            <Expandable hiddenView={<ShowNumber value={income}/>}>
                <table>
                    <thead>
                    <tr>
                        <th>Item</th>
                        <th>Info</th>
                        <th>Count</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                        <th>Radio</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(outputItems || []).map((outputItem) =>
                        <ShowOutputItem key={outputItem.itemHrid} outputItem={outputItem} income={income}/>)}
                    {(dropTable || []).map((drop) =>
                        <ShowCommonDrop key={drop.itemHrid} drop={drop} income={income}/>)}
                    {(essenceDropTable || []).map((drop) =>
                        <ShowEssenceDrop key={drop.itemHrid} drop={drop} income={income}/>)}
                    {(rareDropTable || []).map((drop) =>
                        <ShowRareDrop key={drop.itemHrid} drop={drop} income={income}/>)}
                    </tbody>
                </table>
            </Expandable>
        </DropConfiguration.Provider>
    </DropIncomeGroupOpContext.Provider>
}


export function ShowOutputItem({outputItem, income}: { outputItem: ItemCount, income: number, }) {
    const {itemHrid, count: each} = outputItem
    const {times} = useContext(DropConfiguration);
    const count = each * times
    const [itemIncome, setItemIncome] = useState(0);
    useChildId(DropIncomeGroupOpContext, itemIncome)

    return <tr>
        <th><ShowItem hrid={itemHrid}/></th>
        <td>Output: <ShowNumber value={each}/></td>
        <td><ShowNumber value={count}/></td>
        <td><ShowSellPrice hrid={itemHrid}/></td>
        <td><ShowSellAmount hrid={itemHrid} count={count} onIncomeChange={setItemIncome}/></td>
        <td><ShowPercent value={itemIncome / income}/></td>
    </tr>
}


export function ShowCommonDrop({drop, income}: { drop: DropInfo, income: number, }) {
    const {itemHrid, dropRate, minCount, maxCount} = drop
    const {times, buffData} = useContext(DropConfiguration);
    const count = (minCount + maxCount) / 2 * dropRate * times * (1 + (buffData[NormalBuffType.Gathering]));
    const [itemIncome, setItemIncome] = useState(0);
    useChildId(DropIncomeGroupOpContext, itemIncome)

    return <tr>
        <th><ShowItem hrid={itemHrid}/></th>
        <td>Drop:
            {minCount !== maxCount ?
                <><ShowNumber value={minCount}/>-<ShowNumber value={maxCount}/></> :
                <ShowNumber value={minCount}/>}
            {dropRate !== 1 ? <>~<ShowPercent value={dropRate}/></> : <></>}
        </td>
        <td><ShowNumber value={count}/></td>
        <td><ShowSellPrice hrid={itemHrid}/></td>
        <td><ShowSellAmount hrid={itemHrid} count={count} onIncomeChange={setItemIncome}/></td>
        <td><ShowPercent value={itemIncome / income}/></td>
    </tr>
}

export function ShowEssenceDrop({drop, income}: { drop: DropInfo, income: number, }) {
    const {itemHrid, dropRate, minCount, maxCount} = drop
    const {times, buffData} = useContext(DropConfiguration);
    const count = (minCount + maxCount) / 2 * dropRate * times * (1 + (buffData[NormalBuffType.EssenceFind]));
    const [itemIncome, setItemIncome] = useState(0);
    useChildId(DropIncomeGroupOpContext, itemIncome)

    return <tr>
        <th><ShowItem hrid={itemHrid}/></th>
        <td>Essence:
            {minCount !== maxCount ?
                <><ShowNumber value={minCount}/>-<ShowNumber value={maxCount}/></> :
                minCount !== 1 ?
                    <ShowNumber value={minCount}/> :
                    <></>}
            ~<ShowPercent value={dropRate}/>
        </td>
        <td><ShowNumber value={count}/></td>
        <td><ShowSellPrice hrid={itemHrid}/></td>
        <td><ShowSellAmount hrid={itemHrid} count={count} onIncomeChange={setItemIncome}/></td>
        <td><ShowPercent value={itemIncome / income}/></td>
    </tr>
}


export function ShowRareDrop({drop, income}: { drop: DropInfo, income: number, }) {
    const {itemHrid, dropRate, minCount, maxCount} = drop
    const {buffData} = useContext(DropConfiguration);
    const [itemIncome, setItemIncome] = useState(0);
    useChildId(DropIncomeGroupOpContext, itemIncome)
    const [count, setCount] = useState(0);

    if (minCount !== 1 || maxCount !== 1) {
        return <tr>
            <th><ShowItem hrid={itemHrid}/></th>
            <td colSpan={5}>
                Unknown Rate Drop
            </td>
        </tr>
    }
    return <tr>
        <th><ShowItem hrid={itemHrid}/></th>
        <td>{minCount !== maxCount ?
            <><ShowNumber value={minCount}/>-<ShowNumber value={maxCount}/></> :
            minCount !== 1 ?
                <ShowNumber value={minCount}/> :
                <></>}
            ~<ShowPercent value={dropRate}/>
        </td>
        <td><ShowNumber value={count}/></td>
        <td><ShowSellPrice hrid={itemHrid}/></td>
        <td><ShowLuckyIncome hrid={itemHrid}
                             rate={dropRate * (1 + buffData[NormalBuffType.RareFind])}
                             onIncomeChange={setItemIncome}
                             onCountChange={setCount}/></td>
        <td><ShowPercent value={itemIncome / income}/></td>
    </tr>
}


export function ShowLuckyIncome({hrid, rate, onCountChange, onIncomeChange}: {
    hrid: string,
    rate: number,
    onIncomeChange?: (income: number) => void,
    onCountChange?: (count: number) => void
}) {
    const {times: inputTimes, lucky} = useContext(DropConfiguration);
    const times = Math.round(inputTimes);
    const marketData = useContext(MarketDataContext);
    const price = getSellPriceByHrid(hrid, 0, marketData);
    const count = useMemo(() => {
        let totalPercent = 0
        for (let count = 0; count < times; count++) {
            totalPercent += combination(times, count) * Math.pow(rate, count) * Math.pow(1 - rate, times - count);
            if (totalPercent >= lucky) {
                return count;
            }
        }
        return times
    }, [times, lucky, rate])
    useEffect(() => onCountChange?.(count), [count]);
    const income = count * price;
    useEffect(() => onIncomeChange?.(income), [income]);

    return <LazyExpandable hiddenView={<ShowNumber value={income}/>}>
        <ShowLuckyDistribution times={times} rate={rate} lucky={lucky}/>
    </LazyExpandable>
}

export function ShowLuckyDistribution({times, rate, lucky}: { times: number, rate: number, lucky: number }) {
    const value: { lucky: number, count: number, }[] = []
    let current = 1;
    const unit = 0.005
    let total = 0
    for (let k = 0; k < times && (current + 1) * unit <= 1; k++) {
        total += combination(times, k) * Math.pow(rate, k) * Math.pow(1 - rate, times - k);
        while (current * unit < total) {
            value.push({
                count: k,
                lucky: current * unit
            });
            current++;
        }
    }

    return <LineChart width={600} height={300} data={value}>
        <Line dataKey="count" dot={false}/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip labelFormatter={v => `Lucky = ${(v * 100).toFixed(2)}%`}/>
        <ReferenceLine y={times * rate} label={"Avg = " + formatNumber(times * rate)}/>
        <ReferenceLine x={lucky} label={`Lucky = ${(lucky * 100).toFixed(2)}%`}/>
        <XAxis dataKey="lucky" type="number" tickFormatter={v => `${(v * 100).toFixed(2)}%`}/>
        <YAxis/>
    </LineChart>
}