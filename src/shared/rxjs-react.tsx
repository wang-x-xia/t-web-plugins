import {useEffect, useState} from "react";
import {Observable} from "rxjs";


export function useRecentValues<T>(obs: Observable<T>): T[] {
    const [values, setValues] = useState<T[]>([]);
    useEffect(() => {
        const subscription = obs.subscribe(v => {
            setValues(previous => [...previous, v]);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [obs]);
    return values;
}

export function useLatestValue<T>(obs: Observable<T>): T | null {
    const [value, setValue] = useState<T | null>(null);
    useEffect(() => {
        const subscription = obs.subscribe(setValue);
        return () => {
            subscription.unsubscribe();
        };
    }, [obs]);
    return value;
}

export function useLatestOrDefault<T>(obs: Observable<T>, defaultValue: T): T {
    const [value, setValue] = useState<T>(defaultValue);
    useEffect(() => {
        const subscription = obs.subscribe(setValue);
        return () => {
            subscription.unsubscribe();
        };
    }, [obs]);
    return value;
}