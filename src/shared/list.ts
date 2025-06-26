export function uniqueStrings(arr: string[]): string[] {
    return Array.from(new Set(arr)).sort();
}

export function sum(arr: number[]): number {
    return arr.reduce((acc, b) => acc + b, 0);
}