import * as React from "react";
import {useSettings} from "../settings";

export enum NumberFormat {
    Short = "short",
    Full = "full",
}

export function ShowNumber({value}: { value: number }) {
    const format = useSettings<NumberFormat>("number.format", NumberFormat.Short);
    switch (format) {
        default:
        case NumberFormat.Short:
            return <>{formatWithSuffixes(value)}</>;
        case NumberFormat.Full:
            return <>{formatWithThousandsSeparators(value)}</>;
    }
}

export function ShowPercent({value}: { value: number }) {
    return <>{(value * 100).toPrecision(4)}%</>;
}

export function formatWithThousandsSeparators(num: number): string {
    if (num < 1e-2) {
        return new Intl.NumberFormat("en-US", {useGrouping: true, maximumFractionDigits: 6}).format(num);
    } else if (num < 1) {
        return new Intl.NumberFormat("en-US", {useGrouping: true, maximumFractionDigits: 4}).format(num);
    } else {
        return new Intl.NumberFormat("en-US", {useGrouping: true, maximumFractionDigits: 2}).format(num);

    }
}

export function formatWithSuffixes(num: number): string {
    if (num === 0) {
        return '0';
    }
    const absNum = Math.abs(num);
    if (absNum >= 1e13) {
        // >= 10T
        return formatWithThousandsSeparators(num / 1e12) + 'T';
    }
    if (absNum >= 1e10) {
        // >= 10B
        return formatWithThousandsSeparators(num / 1e9) + 'B';
    }
    if (absNum >= 1e7) {
        // >= 10M
        return formatWithThousandsSeparators(num / 1e6) + 'M';
    }
    if (absNum >= 1e4) {
        // >= 10K
        return formatWithThousandsSeparators(num / 1e3) + 'K';
    }
    return formatWithThousandsSeparators(num);
}
