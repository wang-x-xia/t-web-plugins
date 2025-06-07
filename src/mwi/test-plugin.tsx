import * as React from "react";
import {currentCharacter} from "./engine";
import {LifecycleEvent, registerLifecycle} from "./lifecycle";
import {AddView} from "./view";

export function testPlugin() {
    registerLifecycle("Test", [LifecycleEvent.CharacterLoaded], () => {
            AddView(<div>{JSON.stringify(currentCharacter(), null, 2)}</div>)
        }
    )
}