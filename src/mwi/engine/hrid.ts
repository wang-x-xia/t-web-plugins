import {AllActionType, type AnyActionType} from "./action";
import {AllBuffType, type AnyBuffType, BuffSource} from "./buff-type";

export function getActionTypeHrid(action: AnyActionType): string {
    return `/action_types/${action}`;
}

export function getActionTypeByTypeHrid(hrid: string): AnyActionType | null {
    return Object.values(AllActionType).find((action) => getActionTypeHrid(action) === hrid) || null;
}

export function getSkillHrid(action: AnyActionType): string {
    return `/skills/${action}`;
}

export function getBuffHrid(buffType: AnyBuffType): string {
    return `/buff_types/${buffType}`;
}

export function getBuffTypeByHrid(hrid: string): AnyBuffType | null {
    return Object.values(AllBuffType).find((buffType) => getBuffHrid(buffType) === hrid) || null;
}

export function getBuffUniqueHrid(buffUnique: BuffSource): string {
    return `/buff_uniques/${buffUnique}`;
}

export function getBuffSourceByHrid(hrid: string): BuffSource | null {
    return Object.values(BuffSource).find((buffSource) => getBuffUniqueHrid(buffSource) === hrid) || null;
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