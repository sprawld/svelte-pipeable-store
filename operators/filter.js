
import {readable} from '../store.js';

/**
 * filter
 *
 * Only update value if iterator returns positive (truthy) result
 * same as derived(store, (value, set) => { if(iterator(value)) set(value); })
 *
 * @params {function} iterator Test function (value) => boolean
 * @returns Readable Operator {Function({subscribe, pipe}):}
*/
export function filter(iterator) {

    return ({subscribe}) => {
        return readable(undefined, set => subscribe(v => {
            if(iterator(v)) {
                set(v);
            }
        }));
    }
}
