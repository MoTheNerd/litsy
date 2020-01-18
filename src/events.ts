export type Events = Map<string, Function>;

import {NodeJS} from './global';
declare const global: NodeJS.Global

global.events = new Map<string, Function>();

export const getEvent = (eventName: string): Function => {
    if (global.events.get(eventName) === undefined) {
        setEvent(eventName, () => { console.log(`event ${eventName} has not been implemented`) });
    }
    return global.events.get(eventName)!;
}

export const setEvent = (eventName: string, fx: Function): void => {
    global.events.set(eventName, fx);
}

export const runEvent = (eventName: string, ...args: any): any => {
    if (global.events.get(eventName) === undefined) {
        setEvent(eventName, () => { console.log(`event ${eventName} has not been implemented`) });
    }
    return global.events.get(eventName)!(...args);
}