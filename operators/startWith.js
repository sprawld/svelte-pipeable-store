
import {writable} from '../store.js'

/**
 * startWith
 *
 * @param value
 * @returns {function({subscribe, pipe}): {subscribe, pipe}} Readable operator
 */
export function startWith(value) {

    return ({subscribe, pipe}) => {

        return {
            subscribe(run, invalidate) {
                run(value);
                return subscribe(run, invalidate);
            },
            pipe(...operators) {
                return operators.reduce((src, operator) => operator(src), this);
            }
        };

    }

}
