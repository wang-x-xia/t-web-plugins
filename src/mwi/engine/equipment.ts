import {InitCharacterSubject} from "./engine-event";
import {defineStore, storeSubject} from "./store";

export enum EquipmentTool {
    AlchemyTool = "/item_locations/alchemy_tool",
    BrewingTool = "/item_locations/brewing_tool",
    CheesesmithingTool = "/item_locations/cheesesmithing_tool",
    CookingTool = "/item_locations/cooking_tool",
    CraftingTool = "/item_locations/crafting_tool",
    EnhancingTool = "/item_locations/enhancing_tool",
    ForagingTool = "/item_locations/foraging_tool",
    MilkingTool = "/item_locations/milking_tool",
    TailoringTool = "/item_locations/tailoring_tool",
    WoodcuttingTool = "/item_locations/woodcutting_tool",
}

export enum EquipmentLocation {
    Back = "/item_locations/back",
    Body = "/item_locations/body",
    Earrings = "/item_locations/earrings",
    Feet = "/item_locations/feet",
    Hands = "/item_locations/hands",
    Head = "/item_locations/head",
    Legs = "/item_locations/legs",
    MainHand = "/item_locations/main_hand",
    Neck = "/item_locations/neck",
    OffHand = "/item_locations/off_hand",
    Pouch = "/item_locations/pouch",
    Ring = "/item_locations/ring",
    Trinket = "/item_locations/trinket",
    TwoHand = "/item_locations/two_hand",
}

export interface EquipmentItem {
    location: EquipmentLocation | EquipmentTool
    itemHrid: string
    enhancementLevel: number
}


export function getEquipmentLocationByHrid(hrid: string): EquipmentLocation | EquipmentTool | null {
    return Object.values(EquipmentLocation).find((location) => location === hrid) ||
        Object.values(EquipmentTool).find((tool) => tool === hrid) || null;
}

const EquipmentStore = defineStore<Record<EquipmentLocation | EquipmentTool, EquipmentItem>>({
    id: "equipment",
    name: "Equipment",
    characterBased: true,
    enableSettings: true,
    defaultValue: {} as Record<EquipmentLocation | EquipmentTool, EquipmentItem>,
})

export const Equipments$ = storeSubject(EquipmentStore);
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
        };
    });
    Equipments$.next(localEquipment);
});