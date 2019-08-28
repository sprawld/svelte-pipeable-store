
import {readable} from '../store.js';
import {run_all} from '../internal.js';

/**
 * zip
 *
 * When any source store fires, the destination store updates
 *
 * @param {...{subscribe}} stores Source stores
 * @returns {{subscribe, pipe}}
 */
export function zip(...stores) {

    return readable(undefined, set => {
        let subs = stores.map(store => store.subscribe(set));
        return () => run_all(subs);
    });

}
