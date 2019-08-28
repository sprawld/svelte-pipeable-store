
import {readable} from "../store.js";

/**
 * take
 *
 * Unsubscribe after n values received
 *
 * @params {number} n Number before finishing
 * @returns {{subscribe, pipe, clear}}
 */
export function take(n) {
    return src => {
        let count = 0;
        let {subscribe, pipe} = readable(undefined, set => src.subscribe(value => {
            if(count++ < n) {
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
