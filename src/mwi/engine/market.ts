import {setStringValue} from "../../shared/kv";
import {log} from "../../shared/log";
import {MarketLoaded$} from "./engine-event";
import {getOpenableItem, isItemOpenable, SpecialItems} from "./item";
import {defineStore} from "./store";

const MarketSource = "game_data/marketplace.json"


export interface MarketData {
    /**
     * Hrid -> EnhancementLevel -> {a: ask, b: bid}
     */
    marketData: Record<string, Record<string, { a: number, b: number }>>
    timestamp: number;
}

export function getMarketData() {
    return MarketDataStore.data$.getValue();
}

export function getSellPriceByHrid(hrid: string, enhancementLevel: number = 0, marketData: MarketData | undefined = undefined): number {
    const price = getPriceByHrid(hrid, "b", enhancementLevel, marketData ?? getMarketData());
    return (price < 0) ? 0 : price
}


export function getBuyPriceByHrid(hrid: string, enhancementLevel: number = 0, marketData: MarketData | undefined = undefined): number {
    const price = getPriceByHrid(hrid, "a", enhancementLevel, marketData ?? getMarketData());
    return (price < 0) ? 1e9 : price
}


function getPriceByHrid(hrid: string, field: "a" | "b", enhancementLevel: number = 0, marketData: MarketData): number {
    if (hrid === SpecialItems.Coin) {
        // Coin is always 1
        return 1;
    }
    if (hrid === SpecialItems.CowBell) {
        return getPriceByHrid(SpecialItems.BagOf10CowBells, field, enhancementLevel, marketData) / 10;
    }
    if (marketData.marketData[hrid] === undefined) {
        if (isItemOpenable(hrid) && ![SpecialItems.BagOf10CowBells as string].includes(hrid)) {
            const openableItem = getOpenableItem(hrid)!;
            const otherSellAmount = Object.entries(openableItem.drops).reduce((acc, [dropHrid, dropCount]) => acc +
                getPriceByHrid(dropHrid, field, 0, marketData) * dropCount, 0);
            // The other sell amount is the remaining part except self-drop
            return otherSellAmount / (1 - openableItem.selfDrop);
        }
        return 0;
    }
    return marketData.marketData[hrid][enhancementLevel.toString()]?.[field] ?? -1;
}

export const MarketDataStore = defineStore<MarketData>({
    id: "market",
    name: "Market",
    characterBased: false,
    enableSettings: false,
    defaultValue: {
        marketData: {},
        timestamp: 0,
    },
})

export async function setupMarketData() {
    let marketData = MarketDataStore.data$.getValue();
    if (marketData.timestamp !== 0) {
        MarketLoaded$.complete();
        if (Date.now() / 1000 - marketData.timestamp <= 6 * 60 * 60) {
            // Use cached data
            log("use-cached-market-data", {"data": marketData});
            return;
        } else {
            log("market-data-expired", {"data": marketData});
        }
    }
    marketData = (await (await fetch(MarketSource)).json()) as MarketData;
    setStringValue("marketdata", JSON.stringify(marketData));
    log("loaded-market-data", {"data": marketData});
    MarketDataStore.update(marketData);
    MarketLoaded$.complete();
}