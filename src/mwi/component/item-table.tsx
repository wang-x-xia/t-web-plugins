import * as React from "react";
import {useState} from "react";
import {sum} from "../../shared/list";
import {getBuyPriceByHrid, getSellPriceByHrid} from "../engine/market";
import {ShowItem} from "./item";
import {ShowNumber, ShowPercent} from "./number";

export interface ItemRow {
    hrid: string,
    enhancementLevel: number,
    count: number,
    price: number,
    subtotal: number,
    percent: number,
}

export interface ItemInput {
    hrid: string,
    enhancementLevel?: number,
    count: number,
}

export interface ItemOutput {
    items: ItemRow[],
    total: number,
}

export function prepareSellItems(inputs: ItemInput[]): ItemOutput {
    return prepareItems(inputs, getSellPriceByHrid);
}

export function prepareBuyItems(inputs: ItemInput[]): ItemOutput {
    return prepareItems(inputs, getBuyPriceByHrid);
}

function prepareItems(inputs: ItemInput[], priceFunc: (hrid: string, enhancementLevel: number) => number): ItemOutput {
    const items = inputs.map((input) => {
        const price = priceFunc(input.hrid, input.enhancementLevel ?? 0);
        return ({
            hrid: input.hrid,
            enhancementLevel: input.enhancementLevel ?? 0,
            count: input.count,
            price,
            subtotal: input.count * price,
            percent: 0,
        });
    });
    const total = items.reduce((acc, item) => acc + item.subtotal, 0)
    items.forEach((item) => item.percent = item.subtotal / total);
    return {items, total,};
}

export function BuyItemTable({items, defaultExpand}: { items: ItemInput[], defaultExpand?: boolean }) {
    const {items: preparedItems} = prepareBuyItems(items);
    return <ExpandableItemTable items={preparedItems} defaultExpand={defaultExpand}/>;
}

export function SellItemTable({items, defaultExpand}: { items: ItemInput[], defaultExpand?: boolean }) {
    const {items: preparedItems} = prepareSellItems(items);
    return <ExpandableItemTable items={preparedItems} defaultExpand={defaultExpand}/>;
}

export function ExpandableItemTable({items, defaultExpand}: { items: ItemRow[], defaultExpand?: boolean }) {
    const [expanded, setExpanded] = useState(defaultExpand ?? false);

    if (expanded) {
        return <>
            <button onClick={() => setExpanded(!expanded)}>-</button>
            <ItemTable items={items}/>
        </>
    } else {
        return <>
            <button onClick={() => setExpanded(!expanded)}>+</button>
            <ShowNumber value={sum(items.map(item => item.subtotal))}/>
        </>
    }
}

export function ItemTable({items}: { items: ItemRow[] }) {
    if (items.length === 0) {
        return <></>
    }
    return <table>
        <thead>
        <tr>
            <th>Name</th>
            <th>Count</th>
            <th>Price</th>
            <th>Subtotal</th>
            <th>Radio</th>
        </tr>
        </thead>
        <tbody>
        {items.map((row) => <tr key={`${row.hrid}-${row.enhancementLevel}`}>
            <td><ShowItem hrid={row.hrid} enhancementLevel={row.enhancementLevel}/></td>
            <td><ShowNumber value={row.count}/></td>
            <td><ShowNumber value={row.price}/></td>
            <td><ShowNumber value={row.subtotal}/></td>
            <td><ShowPercent value={row.percent}/></td>
        </tr>)}
        </tbody>
    </table>
}