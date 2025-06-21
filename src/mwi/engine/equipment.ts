import {getBuffsByEquipmentItemHrid} from "./buff";
import type {BasicBuff} from "./buff-type";
import {InitCharacterSubject} from "./engine-event";
import {createCharacterStore} from "./store";

export enum EquipmentTool {
    AlchemyTool = "alchemy_tool",
    BrewingTool = "brewing_tool",
    CheesesmithingTool = "cheesesmithing_tool",
    CookingTool = "cooking_tool",
    CraftingTool = "crafting_tool",
    EnhancingTool = "enhancing_tool",
    ForagingTool = "foraging_tool",
    MilkingTool = "milking_tool",
    TailoringTool = "tailoring_tool",
    WoodcuttingTool = "woodcutting_tool",
}

export enum EquipmentLocation {
    Back = "back",
    Body = "body",
    Earrings = "earrings",
    Feet = "feet",
    Hands = "hands",
    Head = "head",
    Legs = "legs",
    MainHand = "main_hand",
    Neck = "neck",
    OffHand = "off_hand",
    Pouch = "pouch",
    Ring = "ring",
    Trinket = "trinket",
    TwoHand = "two_hand",
}

export interface EquipmentItem {
    location: EquipmentLocation | EquipmentTool
    itemHrid: string
    enhancementLevel: number
    buffs: BasicBuff[]
}

export function getEquipmentLocationHrid(location: EquipmentLocation | EquipmentTool): string {
    return `/item_locations/${location}`
}

export function getEquipmentLocationByHrid(hrid: string): EquipmentLocation | EquipmentTool | null {
    return Object.values(EquipmentLocation).find((location) => getEquipmentLocationHrid(location) === hrid) ||
        Object.values(EquipmentTool).find((tool) => getEquipmentLocationHrid(tool) === hrid) || null;
}

const store = createCharacterStore<Record<EquipmentLocation | EquipmentTool, EquipmentItem>>("equipment");

export function equipmentStore() {
    return store;
}

InitCharacterSubject.subscribe((data) => {
    const localEquipment = {} as Record<EquipmentLocation | EquipmentTool, EquipmentItem>;
    Object.values(data.characterItems).forEach((item) => {
        const location = getEquipmentLocationByHrid(item.itemLocationHrid)
        if (location === null) {
            return;
        }
        localEquipment[location] = {
            location,
            itemHrid: item.itemHrid,
            enhancementLevel: item.enhancementLevel,
            buffs: getBuffsByEquipmentItemHrid(item.itemHrid, item.enhancementLevel),
        };
    });
    store.data = localEquipment;
});