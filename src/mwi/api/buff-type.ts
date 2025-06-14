import type {HridInfo} from "./common-type";


export interface BuffTypeDetails extends HridInfo {
    isCombat: boolean
    description: string
    debuffDescription: string
}

export interface CommunityBuffTypeDetails extends HridInfo {
    description: string
    usableInActionTypeMap: Record<string, true>
    buff: BuffUniqueDetails
}

export interface BuffUniqueDetails {
    uniqueHrid: string
    typeHrid: string
}