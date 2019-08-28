
import {readable} from '../store.js';

/**
 * map
 *
 * same as derived(store, iterator)
 *
 * @params {function} iterator Map function returning destination store value
 * @returns {function({subscribe, pipe}): {subscribe, pipe}} Readable operator
 */
export function map(iterator) {

    return ({subscribe}) => readable(undefined, set => subscribe(v => set(iterator(v))));

}
