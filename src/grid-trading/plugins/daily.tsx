import ReactECharts from 'echarts-for-react';
import * as React from "react";
import {useMemo} from "react";
import {useSetting} from "../../shared/settings";
import {AddView} from "../../shared/view";
import {useDailyKLine} from "../api";
import {CurrentStockSetting} from "../common";

export function dailyPlugin() {
    AddView({id: "kline", name: "Daily Kline", node: <DailyKLine/>})
}

function DailyKLine() {
    const code = useSetting(CurrentStockSetting)
    const data = useDailyKLine(code)

    const options = useMemo(() => {
        return {
            xAxis: {
                data: data?.map(item => item.date) ?? []
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
                    data: data?.map(item => [item.open, item.close, item.low, item.high,]) ?? [],
                }
            ]
        }
    }, [data])

    if (data === null) {
        return <div>Loading...</div>;
    }

    return <>
        <ReactECharts option={options}/>
    </>
}

