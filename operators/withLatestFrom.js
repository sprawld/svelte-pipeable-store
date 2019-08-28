
import {readable} from '../store.js';
import {run_all} from '../internal.js';

/**
 * withLatestFrom
 *
 * @param {...{subscribe}} sources Subscribable secondary source(s)
 * @returns {function({subscribe, pipe}): {subscribe, pipe}} readable operator
 */

export function withLatestFrom(...sources) {

    let {length} = sources;
    return src => {
        return readable(undefined, set => {
            let data = new Array(length);
            let subs = [
                ...sources.map((sub,index) => s.subscribe(value => {
                    data[index] = value;
                })),
                src.subscribe(value => {
                    set([value, ...data]);
                })
            ];
            return () => run_all(subs);
        });
    }
}
