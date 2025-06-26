import {AllActionType, type AnyActionType} from "./action";

export function getActionTypeByTypeHrid(hrid: string): AnyActionType | null {
    return Object.values(AllActionType).find((action) => action === hrid) || null;
}

export function getSkillHrid(action: AnyActionType): string {
    return `/skills/${action.substring("/action_types/".length)}`;
}

/**
 * @param itemHrid like /items/sugar::0
 */
export function resolveItemHrid(itemHrid: string): { hrid: string, enhancementLevel: number } {
    try {
        const [hrid, enhancementLevel] = itemHrid.split("::")
        return {
            hrid,
            enhancementLevel: Number(enhancementLevel),
        }
    } catch (e) {
        console.error(e);
        return {
            hrid: itemHrid,
            enhancementLevel: 0,
        }
    }
}

/**
 * @param itemHash like 000000::/item_locations/inventory::/items/sugar::0
 */
export function resolveItemHash(itemHash: string): { hrid: string, enhancementLevel: number } {
    try {
        const [_character_id, _inventory, hrid, enhancementLevel] = itemHash.split("::")
        return {
            hrid,
            enhancementLevel: Number(enhancementLevel),
        }
    } catch (e) {
        console.error(e);
        return {
            hrid: itemHash,
            enhancementLevel: 0,
        }
    }
}