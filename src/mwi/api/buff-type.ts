import type {HridInfo} from "./common-type";


export interface BuffTypeDetails extends HridInfo {
    isCombat: boolean
    description: string
    debuffDescription: string
}