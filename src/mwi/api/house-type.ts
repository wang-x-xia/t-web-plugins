import type {BuffDetails} from "./buff-type";
import type {HridInfo, ItemCount} from "./common-type";

export interface HouseRoomDetails extends HridInfo {
    skillHrid: string
    usableInActionTypeMap: Record<string, boolean>
    actionBuffs: BuffDetails[]
    globalBuffs: BuffDetails[]
    upgradeCostsMap: Record<string, ItemCount[]>
}