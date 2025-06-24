import {combinations} from "mathjs";
import * as React from "react";
import {CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis} from "recharts";
import {formatNumber} from "./number";

export interface DropData {
    /**
     * How many times the item was dropped
     */
    times: number,
    /**
     * Drop Rate
     */
    rate: number,
}

export function ShowDrop({times, rate}: DropData) {
    const value: { name: string, count: number }[] = []
    let current = 1;
    const unit = 0.005

    let total = 0
    for (let k = 0; k < times && (current + 1) * unit <= 1; k++) {
        total += combinations(times, k) * Math.pow(rate, k) * Math.pow(1 - rate, times - k);
        while (current * unit < total) {
            value.push({name: `${(current * unit * 100).toFixed(2)}%`, count: k});
            current++;
        }
    }

    return <LineChart width={600} height={300} data={value}>
        <Line dataKey="count" dot={false}/>
        <CartesianGrid strokeDasharray="3 3"/>
        <Tooltip/>
        <ReferenceLine y={times * rate} label={"Avg = " + formatNumber(times * rate)}/>
        <XAxis dataKey="name"/>
        <YAxis/>
    </LineChart>
}