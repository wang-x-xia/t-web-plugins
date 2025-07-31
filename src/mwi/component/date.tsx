import * as React from "react";

export function ShowTimestamp({value}: { value: number | string }) {
    return <>{formatTimestamp(value)}</>;
}

export function formatTimestamp(value: number | string) {
    return `${formatDate(value)} ${formatTime(value)}`
}

export function ShowDate({value}: { value: number | string }) {
    return <>{formatDate(value)}</>;
}

export function formatDate(value: number | string) {
    const date = new Date(value);

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${(date.getFullYear())}-${month}-${day}`
}

export function ShowTime({value}: { value: number | string }) {
    return <>{formatTime(value)}</>;
}

export function formatTime(value: number | string) {
    const date = new Date(value);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`
}
