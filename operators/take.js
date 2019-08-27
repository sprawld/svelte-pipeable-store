
import {readable} from "../store.js";

/**
 * take
 *
 * Unsubscribe after n values received
 *
 * @params {number} n Number before finishing
 * @returns {{subscribe, pipe, clear}}
 */
export function take(num) {
    return src => {
        let count = 0;
        let {subscribe, pipe} = readable(undefined, set => {
            let unsub = src.subscribe(v => {
                if(count++ < num) {
                    set(v)
                } else {
                    unsub();
                }
            });
            return () => {
                if(count <= num) {
                    unsub();
                }
            }
        });

        return {
            subscribe, pipe,
            clear() {
                count = 0;
            }
        }
    }
}
