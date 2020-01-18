import { States } from './states'
import { Events } from './events'

declare namespace NodeJS {
    export interface Global {
        states: States,
        events: Events
    }
}