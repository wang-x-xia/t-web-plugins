export interface LootLog {
    startTime: string;
    endTime: string;
    characterActionId: number;
    actionHrid: string;
    primaryItemHash: string;
    secondaryItemHash: string;
    actionCount: number;
    partyId: number;
    drops: { [key: string]: number };
}