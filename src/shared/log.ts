export function log(event: string, args: Record<string, any>) {
    if (process.env.NODE_ENV === "production") {
        return;
    }
    console.log(event, args);
}

