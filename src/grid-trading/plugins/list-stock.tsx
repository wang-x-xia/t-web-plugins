import * as React from "react";
import {ShowSettingValue, useSetting} from "../../shared/settings";
import {AddView} from "../../shared/view";
import {useStockBasic} from "../api";
import {CurrentStockSetting} from "../common";

export function listStockPlugin() {
    AddView({id: "list-stock", name: "List Stock", node: <ListStock/>})
}

function ListStock() {
    const code = useSetting(CurrentStockSetting)
    return <>
        <div>
            <label>Selected Stock:</label>
            <ShowSettingValue setting={CurrentStockSetting}/>
        </div>
        {code === "" ? "Waiting..." :
            <ShowStockBasic code={code}/>}
    </>
}

function ShowStockBasic({code}: { code: string }) {
    const data = useStockBasic(code)

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
                <td>{data.name}</td>
            </tr>
            <tr>
                <th>Currency</th>
                <td>{data.currency}</td>
            </tr>
            </tbody>
        </table>
    </>;
}