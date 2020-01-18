import { NodeJS } from './global';
declare const global: NodeJS.Global

export type StateType = 'persist' | 'session' | 'volatile'

global.states = new Map<string, State>();

export type State = {
    subscribers: Map<string, Function>,
    state: any,
    stateType: StateType
}
export type States = Map<string, State>;

const _getStateRaw = (stateName: string, stateType: StateType = "volatile"): any => {
    let currentState = global.states.get(stateName);
    if (currentState === undefined) {
        if (stateType === "persist") {
            currentState = {
                state: JSON.parse(localStorage.getItem(stateName)),
                stateType: "persist",
                subscribers: new Map<string, Function>()
            }
        } else if (stateType === "session") {
            currentState = {
                state: JSON.parse(sessionStorage.getItem(stateName)),
                stateType: "session",
                subscribers: new Map<string, Function>()
            }
        } else {
            global.states.set(stateName, { subscribers: new Map<string, Function>(), state: {}, stateType: "volatile" });
            currentState = global.states.get(stateName);
        }
    }

    return currentState!;
}

export const getState = (stateName: string, stateType: StateType = "volatile"): any => {
    return _getStateRaw(stateName, stateType)!.state;
}

export const setState = (stateName: string, state: any, stateType: StateType = "volatile"): void => {
    let currentState: State = _getStateRaw(stateName, stateType)
    currentState!.state = state;
    global.states.set(stateName, currentState!);
    if (currentState!.stateType === "persist" || stateType === "persist") {
        localStorage.setItem(stateName, JSON.stringify(currentState!.state))
    } else if (currentState!.stateType === "session" || stateType === "session") {
        sessionStorage.setItem(stateName, JSON.stringify(currentState!.state))
    }
    currentState!.subscribers.forEach((fx: Function) => {
        fx(currentState!.state);
    });
}

export const subscribeToState = (stateName: string, subscriberName: string, fx: Function, stateType: StateType = "volatile"): void => {
    let currentState = _getStateRaw(stateName, stateType);
    let currentSubscribers = currentState!.subscribers;
    currentState!.subscribers = currentSubscribers.set(subscriberName, fx);
    global.states.set(stateName, currentState!);
}