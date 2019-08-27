
import {writable} from "../store";

/**
 * scan
 *
 * Analogous to Array.reduce
 * @params {function} iterator Accumulator function (acc, value) => acc
 * @params {=*} init Initial accumulator value
 * @returns {{subscribe, pipe, set, update}}
 */
export function scan(iterator, init) {

    return src => {
        let acc = init;

        let {subscribe, set, pipe} = writable(undefined, set => src.subscribe(v => {
            acc = iterator(acc, v);
            set(acc);
        }));
        return {
            subscribe, pipe,
            set(value) {
                acc = value;
                set(acc);
            },
            update(iterator) {
                acc = iterator(acc);
                set(acc);
            }
        }
    }

}
