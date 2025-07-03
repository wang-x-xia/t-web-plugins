import type {ReactNode} from "react";
import * as React from "react";


export function Expandable({children, defaultExpanded, hiddenView}: {
    children?: ReactNode, defaultExpanded?: boolean, hiddenView?: ReactNode
}) {
    const [expanded, setExpanded] = React.useState(defaultExpanded ?? false);
    return <>
        <button onClick={() => setExpanded(!expanded)}>{expanded ? "-" : "+"}</button>
        {expanded ? <></> : hiddenView}
        <div style={expanded ? {} : {display: "none"}}>{children}</div>
    </>;
}


export function LazyExpandable({children, defaultExpanded, hiddenView}: {
    children?: ReactNode, defaultExpanded?: boolean, hiddenView?: ReactNode
}) {
    const [expanded, setExpanded] = React.useState(defaultExpanded ?? false);
    return <>
        <button onClick={() => setExpanded(!expanded)}>{expanded ? "-" : "+"}</button>
        {expanded ? children : hiddenView}
    </>;
}