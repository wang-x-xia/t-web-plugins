function binomialInverseCDF(p: number, n: number, prob: number): number {
    if (p < 0 || p > 1) throw new Error("Probability must be between 0 and 1");
    if (n < 0) throw new Error("Number of trials must be non-negative");
    if (prob < 0 || prob > 1) throw new Error("Probability of success must be between 0 and 1");

    let sum = 0;
    let k = 0;
    const logProb = Math.log(prob);
    const log1MinusProb = Math.log(1 - prob);
    const logCombin = (n: number, k: number) => {
        let res = 0;
        for (let i = 1; i <= k; i++) {
            res += Math.log(n - k + i) - Math.log(i);
        }
        return res;
    };

    while (k <= n) {
        const logP = logCombin(n, k) + k * logProb + (n - k) * log1MinusProb;
        sum += Math.exp(logP);
        if (sum >= p) {
            return k;
        }
        k++;
    }

    return n;
}

export function combination(n: number, k: number): number {
    if (k < 0 || k > n) {
        return 0;
    }
    if (k === 0 || k === n) {
        return 1;
    }
    k = Math.min(k, n - k);
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - k + i) / i;
    }
    return res;
}