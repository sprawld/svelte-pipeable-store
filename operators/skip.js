
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

    let count = 0;
    return src => {
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
