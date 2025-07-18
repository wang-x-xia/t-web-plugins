import {sum} from "../../shared/list";
import {DropInfo} from "../api/action-type";
import {type BuffData, NormalBuffType} from "./buff-type";
import {getClientData} from "./client";
import {LuckyModel, luckyModelFactory} from "./drop-math";
import {getOpenableItemDropTable} from "./item";
import {getBuyPriceByHrid, getSellPriceByHrid} from "./market";

export enum DropType {
    /**
     * Fixed drop.
     */
    Output = "output",
    /**
     * Normal drop, buffed by Gathering.
     */
    Normal = "normal",
    /**
     * Essence drop, buffed by EssenceFind.
     */
    Essence = "essence",
    /**
     * Rare drop, buffed by RareFind.
     */
    Rare = "rare",
    /**
     * Rare loot, buffed by RareFind. And also has its drop table
     */
    RareLoot = "rare-loot",
}


export interface ProfitConfiguration {
    action: string;
    hours: number;
    /**
     * If avg, the profit is calculated based on the average of each drop.
     * If lucky, the profit is calculated based on the Binomial Distribution.
     */
    mode: "avg" | "lucky";
    /**
     * The probability of CDF.
     * If set to 0.5, the profit is the median
     */
    lucky: number;
    /**
     * The buff data of the action.
     * Make sure the level info is up to date in the buff data
     */
    buff: BuffData;
}


export interface ItemInputCost {
    hrid: string;
    count: number;
    price: number;
    cost: number;
}

export interface ItemDropInfo {
    rate: number;
    minCount: number;
    maxCount: number;
}

export type ItemDropIncome = NormalItemDropIncome | LootItemDropIncome

export interface NormalItemDropIncome {
    type: DropType.Output | DropType.Normal | DropType.Essence | DropType.Rare;
    model: LuckyModel;
    hrid: string;
    enhancementLevel?: number;
    count: number;
    price: number;
    income: number;
    originDrop: ItemDropInfo;
    buffedDrop: ItemDropInfo;
}

export interface LootItemDropIncome {
    type: DropType.RareLoot;
    model: LuckyModel;
    hrid: string;
    count: number;
    income: number;
    originDrop: ItemDropInfo;
    buffedDrop: ItemDropInfo;
    outputs: {
        model: LuckyModel;
        hrid: string;
        count: number;
        price: number;
        income: number;
        drop: ItemDropInfo;
    }[];
}

export interface ProfitData {
    action: string;
    /**
     * Basic time cost of the action, in seconds.
     */
    baseTimeCost: number;
    /**
     * Time cost of each action with Action Speed buff, in seconds.
     */
    timeCost: number;
    /**
     * Total times of the action based on the input
     */
    times: number;
    profit: number;
    cost: number;
    income: number;
    inputs: ItemInputCost[];
    outputs: ItemDropIncome[];
}


export function getActionProfit({action, hours, mode, lucky, buff}: ProfitConfiguration): ProfitData {
    const actionDetails = getClientData().actionDetailMap[action]
    const basicTimeCost = actionDetails.baseTimeCost / 1e9;
    const timeCost = basicTimeCost / (1 + buff[NormalBuffType.ActionSpeed].value);
    const times = hours * 60 * 60 / timeCost * (1 + buff[NormalBuffType.Efficiency].value);

    const inputs = (actionDetails.inputItems ?? []).map(input => {
        const count = input.count * times;
        const price = getBuyPriceByHrid(input.itemHrid)
        return ({
            hrid: input.itemHrid,
            count,
            price,
            cost: count * price,
        });
    });
    const cost = sum(inputs.map(input => input.cost));

    const outputs: ItemDropIncome[] = [
        ...(actionDetails.outputItems ?? []).map(output => {
            const count = output.count * times;
            const price = getSellPriceByHrid(output.itemHrid);
            const drop = {
                rate: 1,
                minCount: output.count,
                maxCount: output.count,
            }
            return ({
                type: DropType.Output,
                model: luckyModelFactory(times, 1.0, output.count, output.count),
                hrid: output.itemHrid,
                count,
                price,
                income: count * price,
                originDrop: drop,
                buffedDrop: drop,
            }) as NormalItemDropIncome;
        }),
        ...getDropIncome(times, mode, lucky, buff, DropType.Normal, actionDetails.dropTable ?? []),
        ...getDropIncome(times, mode, lucky, buff, DropType.Essence, actionDetails.essenceDropTable ?? []),
        ...getDropIncome(times, mode, lucky, buff, DropType.Rare, actionDetails.rareDropTable ?? []),
    ]
    const income = sum(outputs.map(output => output.income));
    const profit = income - cost;

    return {
        action,
        baseTimeCost: basicTimeCost,
        timeCost,
        times,
        profit,
        cost,
        income,
        inputs,
        outputs,
    }
}

function getDropIncome(times: number, mode: "avg" | "lucky", lucky: number, buff: BuffData, dropType: DropType, drops: DropInfo[]): ItemDropIncome[] {
    return (drops ?? []).map(({itemHrid, minCount, maxCount, dropRate}) => {
        let buffedDropRate = dropRate;
        switch (dropType) {
            case DropType.Essence:
                buffedDropRate *= (1 + buff[NormalBuffType.EssenceFind].value);
                break;
            case DropType.Rare:
                buffedDropRate *= (1 + buff[NormalBuffType.RareFind].value);
                break;
        }
        let buffedMinCount = minCount;
        let buffedMaxCount = maxCount;
        switch (dropType) {
            case DropType.Normal:
                buffedMinCount *= 1 + buff[NormalBuffType.Gathering].value;
                buffedMaxCount *= 1 + buff[NormalBuffType.Gathering].value;
                break;
        }
        const model = luckyModelFactory(times, buffedDropRate, buffedMinCount, buffedMaxCount);
        const count = (mode === "avg") ?
            times * buffedDropRate * (buffedMinCount + buffedMaxCount) / 2 :
            model.getCountOfLucky(lucky);
        const open = getOpenableItemDropTable(itemHrid)
        if (open) {
            // Ignore self drop
            const outputs = getDropIncome(count, mode, lucky, buff, DropType.Output, open)
            return {
                type: DropType.RareLoot,
                model,
                hrid: itemHrid,
                count,
                income: sum(outputs.map(output => output.income)),
                originDrop: {
                    rate: dropRate,
                    minCount,
                    maxCount,
                },
                buffedDrop: {
                    rate: buffedDropRate,
                    minCount: buffedMinCount,
                    maxCount: buffedMaxCount,
                },
                outputs: outputs.map(output => ({
                    hrid: output.hrid,
                    count: output.count,
                    model: output.model,
                    price: (output as any).price,
                    income: output.income,
                    drop: output.originDrop,
                }))
            } as LootItemDropIncome
        } else {
            const price = getSellPriceByHrid(itemHrid);
            return {
                type: dropType,
                model,
                hrid: itemHrid,
                count,
                price,
                income: count * price,
                originDrop: {
                    rate: dropRate,
                    minCount,
                    maxCount,
                },
                buffedDrop: {
                    rate: buffedDropRate,
                    minCount: buffedMinCount,
                    maxCount: buffedMaxCount,
                },
            } as NormalItemDropIncome
        }

    })
}
