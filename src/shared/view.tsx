import * as React from "react";
import {type ErrorInfo, type ReactNode, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Rnd} from "react-rnd";
import {BehaviorSubject} from "rxjs";
import {log, warn} from "./log";
import {useLatestOrDefault} from "./rxjs-react";
import {createBoolSetting, createInternalSetting, getSetting, updateSetting, useSetting} from "./settings";
import viewStyles from "./view.module.css";

export function createApp({id = "app", name, body = document.body}: {
    id?: string,
    name?: string,
    body?: HTMLElement,
}) {
    const container = document.createElement("div")
    container.id = id;
    document.body.insertBefore(container, body.firstChild);
    createRoot(container).render(<App name={name}></App>);
}

interface ChildView {
    id: string,
    name: string,
    node: React.ReactNode
}

const Views$ = new BehaviorSubject<ChildView[]>([]);

export function AddView(child: ChildView) {
    log("add-view", {child});
    const previous = Views$.getValue();
    if (previous.find((c) => c.id === child.id)) {
        warn("duplicate-view", {view: child});
    } else {
        Views$.next([...previous, child]);
    }
}

const POSITION_SETTINGS = createInternalSetting(
    "view.position", "Position",
    {x: 0, y: 0, width: "400px", height: "400px"})

function App({name}: { name?: string }) {
    const [show, setShow] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const position = useRef(getSetting(POSITION_SETTINGS));

    if (!show) {
        // Add a button to the top left corner
        return <button
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 1000000,
                margin: "10px",
            }}
            onClick={() => {
                setShow(true);
            }}>
            {name || "Click to show"}
        </button>
    }

    return <Rnd
        default={position.current}
        bounds="window"
        className={viewStyles.container}
        disableDragging={!editMode}
        enableResizing={editMode}
        onResizeStop={(_event, _direction, ref) => {
            position.current.width = ref.style.width;
            position.current.height = ref.style.height;
        }}
        onDragStop={(_, data) => {
            position.current.x = data.x;
            position.current.y = data.y;
        }}
    >
        <div className={viewStyles.app}>
            <div className={viewStyles.header}>
                {name === undefined ? <></> : <div>{name}</div>}
                <div>
                    <button onClick={() => {
                        setEditMode(!editMode);
                        if (editMode) {
                            updateSetting(POSITION_SETTINGS, position.current);
                        }
                    }}>{editMode ? "Save" : "Move"}
                    </button>
                    <button onClick={() => {
                        setShow(false);
                    }}>-
                    </button>
                </div>
            </div>
            <Views/>
        </div>
    </Rnd>
}

function Views() {
    const children = useLatestOrDefault(Views$, [])
    return <div className={viewStyles.content}>
        {children.map((child) => <ViewChild key={child.id} {...child}/>)}
    </div>
}

function ViewChild({id, name, node}: ChildView) {
    const setting = useMemo(() =>
        createBoolSetting(`view.${id}.show`, `Show ${name}`, true), [id, name]);
    const show = useSetting(setting);

    if (!show) {
        return <div className={viewStyles.child}>
            {name}
            <button onClick={() => updateSetting(setting, true)}>+</button>
        </div>
    }

    return <div className={viewStyles.child}>
        <div>
            {name}
            <button onClick={() => updateSetting(setting, false)}>-</button>
        </div>
        <div className={viewStyles["child-content"]}>
            <ViewSandbox>
                {node}
            </ViewSandbox>
        </div>
    </div>

}

class ViewSandbox extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode; }) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: Error) {
        return {hasError: true};
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        warn("error-boundary", {error, info, ownerStack: React.captureOwnerStack(),});
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <>Error</>;
        }

        return this.props.children;
    }
}