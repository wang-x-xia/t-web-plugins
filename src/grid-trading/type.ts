export interface DailyData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface GridTradingData {
    basic: number;
    cell: number;
}

export interface GridTradingResult {
    basic: number;
    profit: number;
    maxCost: number;
}