import * as React from "react";
import {useEffect, useState} from "react";
import {ShowDate} from "../../mwi/component/date";
import {createStringSelectSetting, ShowSettingValue, useSetting} from "../../shared/settings";
import {AddView} from "../../shared/view";
import stockList from "../data/stock-list.json"
import type {StockData} from "../type";

export function listStockPlugin() {
    AddView({id: "list-stock", name: "List Stock", node: <ListStock/>})
}

const SelectedStockSetting = createStringSelectSetting({
    id: "selected-stock",
    name: "Selected Stock",
    defaultValue: "",
}, stockList.map((s) => ({name: s, value: s})))

function ListStock() {
    const code = useSetting(SelectedStockSetting)
    return <>
        <div>
            <label>Selected Stock:</label>
            <ShowSettingValue setting={SelectedStockSetting}/>
        </div>
        {code === "" ? "Waiting..." :
            <ShowStockBasic code={code}/>}
    </>
}

function ShowStockBasic({code}: { code: string }) {
    const [data, setData] = useState<StockData | null>(null);
    useEffect(() => {
        import((`../data/${code}.json`)).then(setData);
    }, [])

    if (data === null) {
        return <div>Loading...</div>;
    }

    return <>
        <table>
            <tbody>
            <tr>
                <th>Code</th>
                <td>{code}</td>
            </tr>
            <tr>
                <th>Name</th>
                <td>{data.meta.name}</td>
            </tr>
            <tr>
                <th>Currency</th>
                <td>{data.meta.currency}</td>
            </tr>
            <tr>
                <th>Daily Data</th>
                <td>
                    <ShowDate value={new Date(data.daily[0].date).getTime()}/>~
                    <ShowDate value={new Date(data.daily[data.daily.length - 1].date).getTime()}/>
                </td>
            </tr>
            </tbody>
        </table>
    </>;
}