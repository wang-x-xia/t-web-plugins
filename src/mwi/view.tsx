import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Rnd} from "react-rnd";
import viewStyles from "./component/view.module.css";
import {loadSettings, saveSettings} from "./settings";

export function setupApp() {
    const container = document.createElement("div")
    container.id = "mwi-app-container";
    document.body.insertBefore(container, document.body.firstChild);
    createRoot(container).render(<App></App>);
}

interface ChildView {
    id: string
    node: React.ReactNode
}

const childrenBefore: ChildView[] = []
let addView: ((child: ChildView) => void) | undefined = undefined

export function AddView(id: string, child: React.ReactNode) {
    if (addView) {
        addView({id, node: child});
    } else {
        childrenBefore.push({id, node: child});
    }
}

function App() {
    const [show, setShow] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [children, setChildren] = useState<ChildView[]>(childrenBefore);
    const position = useRef(loadSettings("view.position", {
        x: 0,
        y: 0,
        width: "400px",
        height: "400px",
    }))

    useEffect(() => {
        addView = (child) => {
            if (children.find((c) => c.id === child.id)) {
                console.warn({"log-event": "duplicate-view", "id": child.id});
                return;
            }
            setChildren([...children, child]);
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
                            saveSettings("view.position", position.current);
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
                    <div className={viewStyles.child} key={child.id}>{child.node}</div>)}
            </div>
        </div>
    </Rnd>
}
