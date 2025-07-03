import * as React from "react";
import {createContext, useContext, useEffect} from "react";
import {getSellPriceByHrid, type MarketData} from "../engine/market";
import {ShowNumber} from "./number";

export const MarketDataContext = createContext<MarketData | undefined>(undefined);

export function ShowSellPrice({hrid, enhancementLevel, onPriceChange}: {
    hrid: string,
    enhancementLevel?: number,
    onPriceChange?: (price: number) => void
}) {
    const marketData = useContext(MarketDataContext);
    const price = getSellPriceByHrid(hrid, enhancementLevel, marketData);
    useEffect(() => onPriceChange?.(price), [price]);
    return <ShowNumber value={price}/>
}

export function ShowSellAmount({hrid, enhancementLevel, count, onIncomeChange}: {
    hrid: string,
    count: number,
    enhancementLevel?: number,
    onIncomeChange?: (income: number) => void
}) {
    const marketData = useContext(MarketDataContext);
    const income = getSellPriceByHrid(hrid, enhancementLevel, marketData) * count;
    useEffect(() => onIncomeChange?.(income), [income]);
    return <ShowNumber value={income}/>
}