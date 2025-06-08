import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {Rnd} from "react-rnd";
import {loadSettings, saveSettings} from "./settings";

export function setupApp() {
    const container = document.createElement("div")
    container.id = "mwi-app-container";
    document.body.insertBefore(container, document.body.firstChild);
    createRoot(container).render(<App></App>);
}


const childrenBefore: React.ReactNode[] = []
let addView: ((child: React.ReactNode) => void) | undefined = undefined

export function AddView(child: React.ReactNode) {
    if (addView) {
        addView(child);
    } else {
        childrenBefore.push(child);
    }
}

function App() {
    const [editMode, setEditMode] = useState(false);
    const [children, setChildren] = useState<React.ReactNode>(childrenBefore);
    const position = useRef(loadSettings("view.position", {
        x: 0,
        y: 0,
        width: "400px",
        height: "400px",
    }))

    useEffect(() => {
        addView = setChildren;
        return () => {
            addView = undefined;
        }
    }, [])

    return <Rnd
        default={position.current}
        bounds="window"
        style={{
            zIndex: 1000000,
            padding: "2px",
            fontSize: "14px",
            overflow: "auto",
            background: "white",
        }}
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
        <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "10px",
            fontWeight: "bold",
            background: "gray",
        }}>
            <div>Milky Way Idle Helper</div>
            <button onClick={() => {
                setEditMode(!editMode);
                if (editMode) {
                    saveSettings("view.position", position.current);
                }
            }}>{editMode ? "Save" : "Move"}</button>
        </div>
        <div
            style={{
                background: "white",
            }}>
            {children}
        </div>
    </Rnd>
}
