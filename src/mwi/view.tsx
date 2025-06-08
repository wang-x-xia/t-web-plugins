import * as React from "react";
import {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Rnd} from "react-rnd";

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

    useEffect(() => {
        addView = setChildren;
        return () => {
            addView = undefined;
        }
    }, [])

    return <Rnd
        default={{
            x: 0,
            y: 0,
            width: 300,
            height: 300,
        }}
        bounds="window"
        style={{
            zIndex: 1000000,
            padding: "2px",
        }}
        disableDragging={!editMode}
        enableResizing={editMode}>
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
