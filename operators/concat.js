
import {writable} from "../store.js";
/**
 * concat
 *
 * Appends each change to an array.
 *
 * @returns {{subscribe, pipe, clear, set, update}}
*/

export function concat() {

    return src => {

        let list = [];

        let {subscribe, pipe, set} = writable(undefined, set => src.subscribe(value => {
            list.push(value);
            set(list);
        }));
        return {
            subscribe, pipe,
            set(value) {
                list = value;
                set(list);
            },
            update(iterator) {
                list = iterator(list);
                set(list);
            },
            clear() {
                list = [];
                set(list);
            }
        }
    };

}

