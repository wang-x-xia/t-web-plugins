// @ts-ignore
import * as jStat from 'jstat';
import {sum} from "../../shared/list";
import {log} from "../../shared/log";

export abstract class LuckyModel {
    readonly times: number;
    readonly dropRate: number;
    readonly minCount: number;
    readonly maxCount: number;

    abstract get modelMaxValue(): number;

    abstract get modelMinValue(): number;

    protected constructor(times: number, dropRate: number, minCount: number, maxCount: number) {
        this.times = times;
        this.dropRate = dropRate;
        this.minCount = minCount;
        this.maxCount = maxCount;
    }

    getCountOfLucky(lucky: number): number {
        return this.getCountOfLuckyRange([lucky])[0];
    }

    /**
     * @param luckyRange is a sorted array
     */
    abstract getCountOfLuckyRange(luckyRange: number[]): number[]

    abstract getLuckyUntilCount(count: number): number
}

export function luckyModelFactory(times: number, dropRate: number, minCount: number, maxCount: number): LuckyModel {
    if (dropRate > (1 - 1e-9)) {
        // Special case for dropRate = 1
        if (minCount === maxCount) {
            return new AlwaysDropFixed(times, minCount);
        }
    }
    if (times >= 20) {
        if (dropRate <= 0.01 && dropRate * times <= 10) {
            return new PoissonDistribution(times, dropRate, minCount, maxCount);
        } else {
            return new NormalDistribution(times, dropRate, minCount, maxCount);
        }
    }
    if (maxCount >= 100) {
        return new NormalDistribution(times, dropRate, minCount, maxCount);
    } else if (maxCount >= 20) {
        return new DirectCalculate(times, dropRate, Math.round(minCount), Math.round(maxCount));
    } else {
        const delegate = new DirectCalculate(times, dropRate, Math.round(minCount * 5), Math.round(maxCount * 5));
        return new TimesOfCalculate(delegate, 0.2);
    }
}

/**
 * Use for dropRate = 1 and minCount === maxCount
 */
class AlwaysDropFixed extends LuckyModel {

    readonly modelMaxValue: number;
    readonly modelMinValue: number;

    constructor(times: number, count: number) {
        super(times, 1, count, count);
        this.modelMaxValue = count * times;
        this.modelMinValue = count * times;
    }

    getCountOfLucky(lucky: number): number {
        return this.modelMaxValue;
    }

    getCountOfLuckyRange(luckyRange: number[]): number[] {
        return new Array(luckyRange.length).fill(this.modelMaxValue);
    }

    getLuckyUntilCount(count: number): number {
        return count >= this.modelMaxValue ? 1 : 0;
    }
}

/**
 * Use for large times with large drop rate
 */
class NormalDistribution extends LuckyModel {
    readonly modelMaxValue: number;
    readonly modelMinValue: number;
    readonly mean: number;
    readonly std: number;

    constructor(times: number, dropRate: number, minCount: number, maxCount: number) {
        super(times, dropRate, minCount, maxCount);
        this.mean = (minCount + maxCount) / 2 * dropRate * times;
        this.std = Math.sqrt(times * (dropRate * Math.pow(maxCount - minCount, 2) / 12 + (dropRate * (1 - dropRate) * Math.pow(maxCount + minCount, 2) / 4)));
        this.modelMinValue = this.getCountOfLucky(0.001);
        this.modelMaxValue = this.getCountOfLucky(0.999);
    }

    getCountOfLucky(lucky: number): number {
        return Math.round(jStat.normal.inv(lucky, this.mean, this.std));
    }

    getCountOfLuckyRange(luckyRange: number[]): number[] {
        return luckyRange.map(l => Math.round(jStat.normal.inv(l, this.mean, this.std)));
    }

    getLuckyUntilCount(count: number): number {
        return jStat.normal.cdf(count, this.mean, this.std);
    }
}

/**
 * Use for large times with small drop rate, the final result is only a lower value.
 */
class PoissonDistribution extends LuckyModel {
    readonly modelMaxValue: number;
    readonly modelMinValue: number;
    readonly mean: number

    constructor(times: number, dropRate: number, minCount: number, maxCount: number) {
        super(times, dropRate, minCount, maxCount);
        this.mean = (minCount + maxCount) / 2 * dropRate * times;
        this.modelMinValue = 0;
        // Set to max to avoid getCountOfLucky issue
        this.modelMaxValue = this.times * this.maxCount;
        // Shrink to p999
        this.modelMaxValue = this.getCountOfLucky(0.999);
        log("poisson", this);
    }

    getCountOfLuckyRange(luckyRange: number[]): number[] {
        const result: number[] = new Array(luckyRange.length).fill(this.modelMaxValue);
        let index = 0;
        let cdf = 0;
        for (let i = 0; i < this.modelMaxValue; i++) {
            cdf += jStat.poisson.pdf(i, this.mean);
            for (; index < luckyRange.length; index++) {
                if (cdf >= luckyRange[index]) {
                    result[index] = i;
                    continue
                }
                break
            }
            if (index === luckyRange.length) {
                return result;
            }
        }
        return result;
    }

    getLuckyUntilCount(count: number): number {
        return 0;
    }
}


class DirectCalculate extends LuckyModel {
    readonly modelMaxValue: number;
    readonly modelMinValue: number;
    private lazyData: number[] = []

    constructor(times: number, dropRate: number, minCount: number, maxCount: number) {
        super(times, dropRate, minCount, maxCount);
        this.modelMinValue = 0;
        this.modelMaxValue = this.times * this.maxCount;
        log("direct", this);
    }

    get data(): number[] {
        if (this.lazyData.length === 0) {
            const unit = this.dropRate * (this.maxCount - this.minCount + 1);
            let previous: number[] = [1];
            for (let _ = 0; _ < this.times; _++) {
                // the current is [0, previous.max + maxCount]
                // previous.max = previous.length - 1
                // new current length = previous.max + maxCount + 1 = previous.length + maxCount
                const current: number[] = new Array(previous.length + this.maxCount).fill(0);
                for (let count = 0; count < previous.length; count++) {
                    // Not dropped
                    current[count] += previous[count] * (1 - this.dropRate);
                    for (let j = this.minCount; j <= this.maxCount; j++) {
                        // Dropped j
                        current[count + j] += previous[count] * unit;
                    }
                }
                previous = current;
            }
            this.lazyData = new Array(previous.length).fill(0);
            for (let i = 0; i < previous.length; i++) {
                this.lazyData[i] = sum(previous.slice(0, i + 1));
            }
            log("direct-load-data", this);
        }
        return this.lazyData;
    }

    getCountOfLuckyRange(luckyRange: number[]): number[] {
        return luckyRange.map(l => {
            const index = this.data.findIndex(cdf => cdf >= l);
            return index === -1 ? this.modelMaxValue : index;
        });
    }

    getLuckyUntilCount(count: number): number {
        return 0;
    }
}

class TimesOfCalculate extends LuckyModel {

    readonly factor: number
    readonly delegate: DirectCalculate

    constructor(delegate: DirectCalculate, factor: number) {
        super(delegate.times, delegate.dropRate, delegate.minCount * factor, delegate.maxCount * factor);
        this.factor = factor
        this.delegate = delegate
    }

    get modelMaxValue(): number {
        return this.delegate.modelMaxValue * this.factor;
    }

    get modelMinValue(): number {
        return this.delegate.modelMinValue * this.factor;
    }

    getCountOfLuckyRange(luckyRange: number[]): number[] {
        return this.delegate.getCountOfLuckyRange(luckyRange).map(c => c * this.factor);
    }

    getLuckyUntilCount(count: number): number {
        return this.delegate.getLuckyUntilCount(count / this.factor);
    }
}