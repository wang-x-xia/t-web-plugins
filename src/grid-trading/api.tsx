import {useMemo} from "react";
import {switchMap} from "rxjs";
import {fromFetch} from "rxjs/internal/observable/dom/fetch";
import {useLatestOrDefault} from "../shared/rxjs-react";
import {useSetting} from "../shared/settings";
import {ServerSetting} from "./common";

export interface KData {
    date: string,
    open: number,
    close: number,
    low: number,
    high: number,
}

export function useDailyKLine(code: string): KData[] | null {
    const server = useSetting(ServerSetting)

    const data$ = useMemo(() =>
        fromFetch(`${server}/daily/${code}`).pipe(
            switchMap(res => res.json() as Promise<KData[]>),
        ), [code, server]);
    return useLatestOrDefault(data$, [])
}

export interface StockBasic {
    currency: string,
    name: string,
}

export function useStockBasic(code: string): StockBasic | null {
    const server = useSetting(ServerSetting)

    const data$ = useMemo(() =>
        fromFetch(`${server}/basic/${code}`).pipe(
            switchMap(res => res.json() as Promise<StockBasic>),
        ), [code, server]);
    return useLatestOrDefault(data$, null)
}