
import {readable} from '../store.js';

/**
 * pluck
 *
 * @params {string} key Object key to return
 * @returns {{subscribe, pipe}}
*/
export function pluck(key) {

    return ({subscribe}) => readable(undefined, set => subscribe(value => set(value && value[key])));

}
