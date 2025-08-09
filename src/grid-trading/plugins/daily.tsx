import ReactECharts from 'echarts-for-react';
import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {useSetting} from "../../shared/settings";
import {AddView} from "../../shared/view";
import {CurrentStockSetting} from "../common";
import type {StockData} from "../type";

export function dailyPlugin() {
    AddView({id: "kline", name: "Daily Kline", node: <DailyKLine/>})
}

function DailyKLine() {
    const code = useSetting(CurrentStockSetting)
    const [data, setData] = useState<StockData | null>(null);
    useEffect(() => {
        import((`../data/${code}.json`)).then(setData);
    }, [code])

    const options = useMemo(() => {
        return {
            xAxis: {
                data: data?.daily.map(item => item.date) ?? []
            },
            yAxis: {
                scale: true,
            },
            dataZoom: [
                {type: "slider"},
                {type: "inside"},
            ],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            series: [
                {
                    type: "candlestick",
                    data: data?.daily.map(item => [item.open, item.close, item.low, item.high,]) ?? [],
                }
            ]
        }
    }, [data?.daily])

    if (data === null) {
        return <div>Loading...</div>;
    }

    return <>
        <ReactECharts option={options}/>
    </>
}

