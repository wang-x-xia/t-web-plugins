import * as React from "react";
import {type ReactNode, useState} from "react";

export function Expandable({children, defaultExpand}: { children: ReactNode, defaultExpand?: boolean }) {
    const [expanded, setExpanded] = useState(defaultExpand ?? false);

    return <>
        <button onClick={() => setExpanded(!expanded)}>
            {expanded ? "-" : "+"}
        </button>
        <div style={expanded ? {} : {display: "none"}}>
            {children}
        </div>
    </>;
}
