
import {safe_not_equal} from "../internal.js";
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
export function distinct() {

    return ({subscribe}) => readable(undefined, set => {
        let last;
        return subscribe(v => {
            if(safe_not_equal(last,v)) {
                set(v);
                last = v;
            }
        });
    });

}
