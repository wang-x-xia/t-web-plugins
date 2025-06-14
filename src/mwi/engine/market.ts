import {log} from "../../shared/log";
import {getOpenableItem, isItemOpenable} from "./item";

const MarketSource = "https://www.milkywayidle.com/game_data/marketplace.json"


export interface MarketData {
    /**
     * Hrid -> EnhancementLevel -> {a: ask, b: bid}
     */
    marketData: Record<string, Record<string, { a: number, b: number }>>
    timestamp: number;
}

let markerData: MarketData | null = null;

export function getMarketData() {
    if (!markerData) {
        throw new Error("Market data not loaded");
    }
    return markerData;
}

export function getSellPriceByHrid(hrid: string, enhancementLevel: number = 0): number {
    if (getMarketData().marketData[hrid] === undefined) {
        if (isItemOpenable(hrid)) {
            const openableItem = getOpenableItem(hrid)!;
            const otherSellAmount = Object.entries(openableItem.drops).reduce((acc, [dropHrid, dropCount]) => acc +
                getSellPriceByHrid(dropHrid) * dropCount, 0);
            // The other sell amount is the remaining part except self-drop
            return otherSellAmount / (1 - openableItem.selfDrop);
        }
        return 0;
    }
    return getMarketData().marketData[hrid][enhancementLevel.toString()].b;
}

export async function setupMarketData() {
    if (GM_getValue("marketdata", false)) {
        markerData = JSON.parse(GM_getValue("marketdata", "{}") as string) as MarketData;
        if (Date.now() / 1000 - markerData.timestamp <= 6 * 60 * 60) {
            // Use cached data
            log("use-cached-market-data", {"data": markerData});
            return;
        } else {
            log("market-data-expired", {"data": markerData});
        }
    }
    markerData = (await (await fetch(MarketSource)).json()) as MarketData;
    GM_setValue("marketdata", JSON.stringify(markerData));
    log("loaded-market-data", {"data": markerData});
}