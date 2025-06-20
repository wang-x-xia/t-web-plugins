import * as React from "react";
import {getItemName} from "../engine/item";
import {getBuyPriceByHrid, getSellPriceByHrid} from "../engine/market";
import {ShowNumber, ShowPercent} from "./number";

export interface ItemRow {
    name: string,
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
            name: getItemName(input.hrid),
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
        {items.map((row) => <tr key={row.name}>
            <td>{row.name}{row.enhancementLevel > 0 && `+${row.enhancementLevel}`}</td>
            <td><ShowNumber value={row.count}/></td>
            <td><ShowNumber value={row.price}/></td>
            <td><ShowNumber value={row.subtotal}/></td>
            <td><ShowPercent value={row.percent}/></td>
        </tr>)}
        </tbody>
    </table>
}