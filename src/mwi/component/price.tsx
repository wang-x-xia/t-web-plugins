import * as React from "react";
import {createContext, useContext} from "react";
import {getSellPriceByHrid, type MarketData} from "../engine/market";
import {ShowNumber} from "./number";

export const MarketDataContext = createContext<MarketData | undefined>(undefined);

export function ShowSellPrice({hrid, enhancementLevel}: { hrid: string, enhancementLevel?: number }) {
    const marketData = useContext(MarketDataContext);
    return <ShowNumber value={getSellPriceByHrid(hrid, enhancementLevel, marketData)}/>
}

export function ShowSellAmount({hrid, enhancementLevel, count}: {
    hrid: string,
    enhancementLevel?: number,
    count: number
}) {
    const marketData = useContext(MarketDataContext);
    return <ShowNumber value={getSellPriceByHrid(hrid, enhancementLevel, marketData) * count}/>
}