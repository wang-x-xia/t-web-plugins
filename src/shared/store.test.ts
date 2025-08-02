import {BehaviorSubject} from "rxjs";
import {createStore} from "./store";

test("Store Basic", () => {
    const store = createStore({
        id: `test-basic-${Date.now()}`,
        name: "Test",
        path$: new BehaviorSubject<string | null>(""),
        defaultValue: {}
    });
    expect(store.data$.getValue()).toStrictEqual({});
    store.update({"data": "test"});
    expect(store.data$.getValue()).toStrictEqual({"data": "test"});
    store.reset();
    expect(store.data$.getValue()).toStrictEqual({});
})

test("Store Path", () => {
    const store = createStore({
        id: `test-path-${Date.now()}`,
        name: "Test",
        path$: new BehaviorSubject<string | null>("test"),
        defaultValue: {}
    });
    store.update({"data": "test"});
    expect(store.data$.getValue()).toStrictEqual({"data": "test"});

    store.path$.next("test2");
    // The test2 uses default value
    expect(store.data$.getValue()).toStrictEqual({});
    store.update({"data": "test2"});
    expect(store.data$.getValue()).toStrictEqual({"data": "test2"});

    // Change back to test
    store.path$.next("test");
    expect(store.data$.getValue()).toStrictEqual({"data": "test"});
    store.reset()

    store.path$.next("test2");
    expect(store.data$.getValue()).toStrictEqual({"data": "test2"});
})

test("2 Stores", () => {
    const id = `test-2-stores-${Date.now()}`
    const store = createStore({
        id,
        name: "Test",
        path$: new BehaviorSubject<string | null>(""),
        defaultValue: {}
    });
    store.update({"data": "test"});

    const store2 = createStore({
        id,
        name: "Test Another",
        path$: new BehaviorSubject<string | null>(""),
        defaultValue: {}
    });
    // Read previous write
    expect(store2.data$.getValue()).toStrictEqual({"data": "test"});
    store2.update({"data": "test2"});
    expect(store2.data$.getValue()).toStrictEqual({"data": "test2"});

    // The old store currently isn't affected
    // It's not a feature and can be changed if needed
    expect(store.data$.getValue()).toStrictEqual({"data": "test"});
})

test("Store With Null Path", () => {
    const store = createStore({
        id: `test-null-path-${Date.now()}`,
        name: "Test",
        path$: new BehaviorSubject<string | null>(null),
        defaultValue: {}
    });
    expect(store.data$.getValue()).toStrictEqual({});
    expect(() => store.update({"data": "test"})).toThrow();
})