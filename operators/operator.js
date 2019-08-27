
import {readable} from "../store.js";

// construct a basic operator with readable pipe from iterator
// @@params {function} iterator (value, set)
export function operator(iterator, name) {

    return (src, value) => readable(value, set => {
        console.log(`op ${name}`);
        return src.subscribe(v => iterator(v, set));
    });

}


export function readop(iterator) {
    return ({subscribe}) => readable(undefined, set => subscribe(value => iterator(value, set)));
}


export function writeop(iterator) {
    return ({subscribe}) => writable(undefined, set => subscribe(value => iterator(value, set)));
}

