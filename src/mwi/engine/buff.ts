import {produce} from "immer";
import {combineLatest} from "rxjs";
import {sum} from "../../shared/list";
import {warn} from "../../shared/log";
import type {NoncombatBuffs} from "../api/buff-type";
import type {InitCharacterData} from "../api/message-type";
import {
    AlchemyActionType,
    type AnyActionType,
    CollectActionType,
    CombatActionType,
    EnhancingActionType,
    ManufacturingActionType
} from "./action";
import {
    type AnyBuffType,
    type BuffData,
    BuffSource,
    type BuffTypeData,
    EnhancingBuffType,
    NormalBuffType
} from "./buff-type";
import {getClientData} from "./client";
import {InitCharacterData$} from "./engine-event";
import {EquipmentStore} from "./equipment";
import {defineStore, type StoreDataOfSubject} from "./store";

export function getBuffTypeName(action: AnyBuffType) {
    return getClientData().buffTypeDetailMap[action].name
}

export function getKeysOfNonCombatStat(action: AnyActionType, buffType: AnyBuffType): (keyof NoncombatBuffs)[] {
    const shortAction = action.substring("/action_types/".length)
    switch (buffType) {
        case NormalBuffType.Wisdom:
            return [
                `${shortAction}Experience` as keyof NoncombatBuffs,
                "skillingExperience",
            ]
        case EnhancingBuffType.EnhancingSuccess:
            return ["enhancingSuccess"]
        case NormalBuffType.Efficiency:
            if (action === EnhancingActionType.Enhancing) {
                return []
            }
            return [
                `${shortAction}Efficiency` as keyof NoncombatBuffs,
                "skillingEfficiency",
            ]
        case NormalBuffType.ActionSpeed:
            return [
                `${shortAction}Speed` as keyof NoncombatBuffs,
                "skillingSpeed",
            ]
        case NormalBuffType.Gathering:
            return ["gatheringQuantity"]
        case NormalBuffType.EssenceFind:
            return ["skillingEssenceFind"]
        case NormalBuffType.RareFind:
            return [
                `${shortAction}RareFind` as keyof NoncombatBuffs,
                "skillingRareFind",
            ]
        default:
            warn("unknown-buff-type", {action, buffType})
            return []
    }
}

export function getBuffValueOfEquipment(action: AnyActionType, buffType: AnyBuffType, hrid: string, enhancementLevel: number): number {
    const keys = getKeysOfNonCombatStat(action, buffType);
    if (!keys.length) {
        return 0
    }
    const equipmentDetail = getClientData().itemDetailMap[hrid]?.equipmentDetail
    if (!equipmentDetail) {
        warn("no-equipment-details", {hrid})
        return 0
    }
    const basic = sum(keys.map((key) => equipmentDetail.noncombatStats[key] ?? 0))
    const bonus = sum(keys.map((key) => equipmentDetail.noncombatEnhancementBonuses[key] ?? 0))
    return basic + getClientData().enhancementLevelTotalBonusMultiplierTable[enhancementLevel] * bonus
}


export function getBuffValueOfTea(action: AnyActionType, buffType: AnyBuffType, hrid: string): number {
    const keys = getKeysOfNonCombatStat(action, buffType);
    if (!keys.length) {
        return 0
    }
    const consumableDetail = getClientData().itemDetailMap[hrid]?.consumableDetail
    if (!consumableDetail || !consumableDetail.buffs) {
        warn("no-tea-details", {hrid})
        return 0
    }
    return sum(consumableDetail.buffs.filter(it => it.typeHrid === buffType)
        .map(it => it.flatBoost))
}

export function createEmptyBuffData(): BuffData {
    function createEmptyBuffTypeData(): BuffTypeData {
        return {
            value: 0,
            [BuffSource.Equipment]: {
                value: 0,
                equipments: [],
            },
            [BuffSource.MooPass]: {
                value: 0,
            },
            [BuffSource.Community]: {
                value: 0,
            },
            [BuffSource.House]: {
                value: 0,
            },
            [BuffSource.Room]: {
                value: 0,
            },
            [BuffSource.Tea]: {
                value: 0,
                slots: [],
            },
            [BuffSource.Level]: {
                value: 0,
                levelRequirement: 0,
                level: 0
            }
        }
    }

    return {
        [NormalBuffType.ActionSpeed]: createEmptyBuffTypeData(),
        [NormalBuffType.Efficiency]: createEmptyBuffTypeData(),
        [NormalBuffType.Gathering]: createEmptyBuffTypeData(),
        [NormalBuffType.Wisdom]: createEmptyBuffTypeData(),
        [EnhancingBuffType.EnhancingSuccess]: createEmptyBuffTypeData(),
        [NormalBuffType.EssenceFind]: createEmptyBuffTypeData(),
        [NormalBuffType.RareFind]: createEmptyBuffTypeData(),
    }
}

export const BuffDataStore = defineStore<Record<Exclude<AnyActionType, CombatActionType>, BuffData>>({
    id: "buff-data",
    name: "Buff Data",
    characterBased: true,
    enableSettings: false,
    defaultValue: {
        [CollectActionType.Foraging]: createEmptyBuffData(),
        [CollectActionType.Milking]: createEmptyBuffData(),
        [CollectActionType.Woodcutting]: createEmptyBuffData(),
        [ManufacturingActionType.Cheesesmithing]: createEmptyBuffData(),
        [ManufacturingActionType.Crafting]: createEmptyBuffData(),
        [ManufacturingActionType.Tailoring]: createEmptyBuffData(),
        [ManufacturingActionType.Cooking]: createEmptyBuffData(),
        [ManufacturingActionType.Brewing]: createEmptyBuffData(),
        [AlchemyActionType.Alchemy]: createEmptyBuffData(),
        [EnhancingActionType.Enhancing]: createEmptyBuffData(),
    },
})

export function produceLevelData(buffData: BuffData, levelRequirement: number, level: number) {
    return produce(buffData, (draft) => {
        const efficiency = draft[NormalBuffType.Efficiency];
        // Process efficiency of level
        let value = (level - levelRequirement) * 0.01;
        if (levelRequirement > level) {
            // Reset efficiency
            efficiency.value = -1;
        } else {
            efficiency.value += value;
        }
        efficiency[BuffSource.Level] = {value, level, levelRequirement,};
        return draft
    })
}

combineLatest({characterData: InitCharacterData$, equipmentData: EquipmentStore.data$}).subscribe(
    (({characterData, equipmentData}) => {
        BuffDataStore.update(Object.fromEntries([CollectActionType, ManufacturingActionType, AlchemyActionType, EnhancingActionType]
            .flatMap((typeEnum) => Object.values(typeEnum)
                .map((actionType) => [actionType, createBuffData(actionType, characterData, equipmentData)]))
        ));
    })
)

export function createBuffData(actionType: AnyActionType,
                               characterData: InitCharacterData,
                               equipmentData: StoreDataOfSubject<typeof EquipmentStore.data$>): BuffData {
    return {
        [NormalBuffType.ActionSpeed]: createBuffSourceData(actionType, NormalBuffType.ActionSpeed, characterData, equipmentData),
        [NormalBuffType.Efficiency]: createBuffSourceData(actionType, NormalBuffType.Efficiency, characterData, equipmentData),
        [NormalBuffType.Gathering]: createBuffSourceData(actionType, NormalBuffType.Gathering, characterData, equipmentData),
        [NormalBuffType.Wisdom]: createBuffSourceData(actionType, NormalBuffType.Wisdom, characterData, equipmentData),
        [NormalBuffType.RareFind]: createBuffSourceData(actionType, NormalBuffType.RareFind, characterData, equipmentData),
        [NormalBuffType.EssenceFind]: createBuffSourceData(actionType, NormalBuffType.EssenceFind, characterData, equipmentData),
        [EnhancingBuffType.EnhancingSuccess]: createBuffSourceData(actionType, EnhancingBuffType.EnhancingSuccess, characterData, equipmentData),
    }
}

function createBuffSourceData(actionType: AnyActionType, buffType: AnyBuffType,
                              characterData: InitCharacterData,
                              equipmentData: StoreDataOfSubject<typeof EquipmentStore.data$>): BuffTypeData {
    const equipment = createEquipmentBuffSourceData(actionType, buffType, equipmentData);
    const mooPass = createNormalBuffSourceData(actionType, buffType, characterData, "mooPassActionTypeBuffsMap");
    const community = createNormalBuffSourceData(actionType, buffType, characterData, "communityActionTypeBuffsMap");

    const houseOrRoom = createNormalBuffSourceData(actionType, buffType, characterData, "houseActionTypeBuffsMap")
    const house = (buffType === NormalBuffType.RareFind || buffType === NormalBuffType.Wisdom) ? houseOrRoom : {value: 0};
    const room = (buffType === NormalBuffType.RareFind || buffType === NormalBuffType.Wisdom) ? {value: 0} : houseOrRoom;
    const tea = createTeaBuffSourceData(actionType, buffType, characterData);
    const level = {value: 0, levelRequirement: 0, level: 0};

    return {
        value: sum([equipment.value, mooPass.value, community.value, house.value, room.value, tea.value, level.value]),
        [BuffSource.Equipment]: equipment,
        [BuffSource.MooPass]: mooPass,
        [BuffSource.Community]: community,
        [BuffSource.House]: house,
        [BuffSource.Room]: room,
        [BuffSource.Tea]: tea,
        [BuffSource.Level]: level,
    }
}

function createEquipmentBuffSourceData(
    actionType: AnyActionType, buffType: AnyBuffType,
    equipmentData: StoreDataOfSubject<typeof EquipmentStore.data$>): BuffTypeData[BuffSource.Equipment] {
    const equipments = Object.values(equipmentData)
        .map(equipment => ({
            equipment,
            value: getBuffValueOfEquipment(actionType, buffType, equipment.itemHrid, equipment.enhancementLevel)
        }))
        .filter(it => it.value > 0);
    return {
        value: sum(equipments.map(it => it.value)),
        equipments,
    }
}

function createNormalBuffSourceData(
    actionType: AnyActionType, buffType: AnyBuffType,
    characterData: InitCharacterData,
    buffMapKey: "mooPassActionTypeBuffsMap" | "communityActionTypeBuffsMap" | "houseActionTypeBuffsMap")
    : { value: number } {
    return {
        value: sum((characterData[buffMapKey][actionType] ?? [])
            .filter(it => it.typeHrid === buffType)
            .map(it => it.flatBoost)),
    }
}

function createTeaBuffSourceData(
    actionType: AnyActionType, buffType: AnyBuffType,
    characterData: InitCharacterData): BuffTypeData[BuffSource.Tea] {
    const slots = characterData.actionTypeDrinkSlotsMap[actionType].flatMap((slot, index) => {
        if (slot === null) {
            return [];
        }
        const buffValue = getBuffValueOfTea(actionType, buffType, slot.itemHrid)
        if (!buffValue) {
            return []
        }
        return [{
            slot: index,
            tea: slot.itemHrid,
            value: buffValue,
        }]
    })
    return {
        value: sum(slots.map(it => it.value)),
        slots,
    }
}