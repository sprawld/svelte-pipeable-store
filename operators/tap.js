
import {readable} from '../store.js';

/**
 *  tap
 *
 *  Listen to pipeline (and produce side effects)
 *  Passes all functions of source operator
 *
 *  @params iterator(value) => void
 *  @returns {{...source store}}
*/
export function tap(iterator) {

    return src => {
        let {subscribe, pipe} = readable(undefined, set => src.subscribe(value => {
            iterator(value);
            set(value);
        }));
        return {
            ...src,
            subscribe, pipe,
        }
    }

}
