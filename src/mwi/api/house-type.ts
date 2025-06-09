import type {Buff} from "./character-type";
import type {HridInfo, ItemCount} from "./common-type";

export interface HouseRoomDetails extends HridInfo {
    skillHrid: string
    usableInActionTypeMap: Record<string, boolean>
    actionBuffs: Buff[]
    globalBuffs: Buff[]
    upgradeCostsMap: Record<string, ItemCount[]>
}