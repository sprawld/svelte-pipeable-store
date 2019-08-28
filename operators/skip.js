
import {readable} from '../store.js';

/**
 * skip
 *
 * Don't pass on the first n items
 *
 * @params {number} n Number to skip
 * @returns {{subscribe, pipe, clear}}
 */
export function skip(n) {

    return src => {
        let count = 0;
        let {subscribe, pipe} = readable(undefined, set => src.subscribe(value => {
            if(++count > n) {
                set(value);
            }
        }));
        return {
            subscribe, pipe,
            clear() {
                count = 0;
            }
        }
    }

}

/**
 * skipWhile
 *
 * Don't pass on the first n items
 *
 * @params {function} iterator Validation function
 * @returns {{subscribe, pipe, clear}}
 */
export function skipWhile(iterator) {

    return src => {
        let skipping = true;
        let {subscribe, pipe} = readable(undefined, set => src.subscribe(value => {
            if(skipping && iterator(value)) {
                skipping = false;
            }
            if(!skipping) {
                set(value);
            }
        }));
        return {
            subscribe, pipe,
            clear() {
                skipping = true;
            }
        }
    }

}

