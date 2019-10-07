import axios from 'axios';
import { Map } from 'immutable'

export interface ICreateAPICallOptions {
    url: string;
    method: 'get' | 'put' | 'post' | 'delete' | 'head';
    storeName: StoreName | undefined;
    stateName: StateName | undefined;
    saveToStore: Persistence;
    bodyData: any;
};

export const createAPICall = (createAPIObject: ICreateAPICallOptions) => async () => {
    const { url, method, storeName, saveToStore, stateName, bodyData } = createAPIObject
    if (axios[method]) {
        let canChangeData: boolean, store: Store;
        canChangeData = storeName && storeName !== "" && stateName && stateName.replace(/\s/g, '') !== "";
        if (canChangeData) {
            // set dirty true
            store = getStore(storeName, saveToStore)
            store.setState(stateName, { ...store.getState(stateName), dirty: true })
        }

        // @ts-ignore
        let result = await axios[method](`${url}`, method === 'get' || method === 'delete' || method === 'head' ? undefined : bodyData);

        if (canChangeData) {
            // set dirty false and set new data
            store.setState(stateName, result.data)
        }
    }
}

export interface IStoreOptions {
    storeName: StoreName,
    persist: Persistence
}

function instanceOfIStoreOptions(object: any): object is IStoreOptions {
    return typeof <IStoreOptions>object.storeName === "string" && typeof <IStoreOptions>object.persist === "boolean";
}

var stores = Map();

export const getStore = (storeName: StoreName, presistent: Persistence): Store | undefined => {
    const store = stores.get(`${presistent ? 'persist' : 'no_persist'}.${storeName}`)
    if (store instanceof Store) {
        return store;
    } else {
        // try creating a store based on existing data in local/session storage
        if (presistent) {
            if (localStorage.getItem(storeName) !== null) {
                return new Store({ storeName: storeName, persist: presistent });
            };
        } else {
            if (sessionStorage.getItem(storeName) !== null) {
                return new Store({ storeName: storeName, persist: presistent });
            };
        };
        return;
    }
}

const setStore = (storeName: StoreName, presistent: Persistence, store: Store) => {
    stores = stores.set(`${presistent ? 'persist' : 'no_persist'}.${storeName}`, store);
}

type SubscriberFn = Function;
type SubscriberName = string;
type StateName = string;
type Persistence = boolean;
type StoreName = string;
type Subscribers = Map<SubscriberName, SubscriberFn>;
type State = any;

export class Store {

    storeName: StoreName;
    persist: Persistence;
    stateSubscribers: Map<StateName, Subscribers>;
    states: Map<StateName, State>;

    constructor(storeOptions?: IStoreOptions) {
        if (instanceOfIStoreOptions(storeOptions)) {
            this.storeName = storeOptions.storeName;
            this.persist = storeOptions.persist;
        }

        let initialStore: any
        if (storeOptions.persist) {
            initialStore = JSON.parse(localStorage.getItem(storeOptions.storeName))
        } else {
            initialStore = JSON.parse(sessionStorage.getItem(storeOptions.storeName))
        }
        this.states = initialStore && initialStore["states"] ? Map(initialStore.states) : Map();
        this.stateSubscribers = Map();

        setStore(storeOptions.storeName, storeOptions.persist, this);
    }

    getStoreName(): StoreName {
        return this.storeName;
    }

    getState(stateName: StateName): State {
        return this.states.get(stateName);
    }

    setState(stateName: StateName, state: any): void {
        this.states = this.states.set(stateName, state);
        this._notifyAll(stateName);
        if (this.persist) {
            localStorage.setItem(this.storeName, JSON.stringify({ states: this.states }))
        } else {
            sessionStorage.setItem(this.storeName, JSON.stringify({ states: this.states }))
        };
        setStore(this.storeName, this.persist, this);
    }

    subscribe(stateName: StateName, subscriberName: SubscriberName, callBackFn: SubscriberFn): void {
        let subscribers = this.stateSubscribers.get(stateName)
        if (!subscribers) {
            subscribers = Map();
        }
        subscribers = subscribers.set(subscriberName, callBackFn);
        this.stateSubscribers = this.stateSubscribers.set(stateName, subscribers)

        setStore(this.storeName, this.persist, this);
    }

    unsubscribe(stateName: StateName, subscriberName: SubscriberName): void {
        let subscribers = this.stateSubscribers.get(stateName)
        if (subscribers) {
            subscribers.delete(subscriberName);
            this.stateSubscribers = this.stateSubscribers.set(stateName, subscribers);
        }
        setStore(this.storeName, this.persist, this);
    }

    _notifyAll(stateName: StateName): void {
        const allSubscribers = this.stateSubscribers.get(stateName)
        if (allSubscribers) {
            Array.from(allSubscribers.values()).forEach(callBackFn => {
                callBackFn(this.getState(stateName))
            })
        }
    };
}

var events = Map()

export class Event {
    eventName: string;
    event: Function;
}