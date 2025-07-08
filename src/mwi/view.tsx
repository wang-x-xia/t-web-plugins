import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Rnd} from "react-rnd";
import {log, warn} from "../shared/log";
import {createBoolSetting, createInternalSetting, getSetting, updateSetting, useSetting} from "../shared/settings";
import viewStyles from "./component/view.module.css";

export function setupApp() {
    const container = document.createElement("div")
    container.id = "mwi-app-container";
    document.body.insertBefore(container, document.body.firstChild);
    createRoot(container).render(<App></App>);
}

interface ChildView {
    id: string,
    name: string,
    node: React.ReactNode
}

const childrenBefore: ChildView[] = []
let addView: ((child: ChildView) => void) | undefined = undefined

export function AddView(child: ChildView) {
    log("add-view", {child});
    if (addView) {
        addView(child);
    } else if (childrenBefore.find((c) => c.id === child.id)) {
        warn("duplicate-view", {view: child});
    } else {
        childrenBefore.push(child);
    }
}

const POSITION_SETTINGS = createInternalSetting(
    "view.position", "Position",
    {x: 0, y: 0, width: "400px", height: "400px"})

function App() {
    const [show, setShow] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [children, setChildren] = useState<ChildView[]>(childrenBefore);
    const position = useRef(getSetting(POSITION_SETTINGS));

    useEffect(() => {
        addView = (child) => {
            setChildren(previous => {
                if (previous.find((c) => c.id === child.id)) {
                    warn("duplicate-view", {child});
                    return previous;
                }
                return [...previous, child]
            });
        };
        return () => {
            addView = undefined;
        }
    }, [])

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
            MWI Helper
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
                <div>Milky Way Idle Helper</div>
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
            <div className={viewStyles.content}>
                {children.map((child) =>
                    <ViewChild key={child.id} {...child}/>)}
            </div>
        </div>
    </Rnd>
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
        {node}
    </div>

}