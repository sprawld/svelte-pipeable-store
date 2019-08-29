
import {readable} from '../store.js';

export function delay(time) {

    return src => readable(undefined, set => src.subscribe(value => {
        setTimeout(() => {
            set(value);
        },time);
    }));

}
