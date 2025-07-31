export interface DailyData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface StockData {
    daily: DailyData[];
    meta: {
        name?: string;
        currency?: string;
    }
}