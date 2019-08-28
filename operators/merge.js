
import {readable} from "../store";
import {run_all} from "../internal";

/**
 * merge
 *
 * When any source store fires, the destination store updates
 *
 * @param {...{subscribe}} stores Source stores
 * @returns {{subscribe, pipe}}
 */
export function merge(...stores) {

    return readable(undefined, set => {
        let subs = stores.map(store => store.subscribe(set));
        return () => run_all(subs);
    });

}
