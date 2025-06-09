import type {HridInfo, ItemCount} from "./common-type";

export interface RandomTaskTypeDetails {
    hrid: string;
    isCombat: boolean
    skillHrid: string
    sortIndex: number;
}

export interface ShopItemDetails extends HridInfo {
    itemHrid: string
    cost: ItemCount
}