import * as React from "react";
import {getItemName} from "../engine/item";

export function ShowItem({hrid, enhancementLevel}: { hrid: string, enhancementLevel?: number }) {
    return <>{getItemName(hrid)}{(enhancementLevel && enhancementLevel > 0) ? ` +${enhancementLevel}` : ""}</>
}