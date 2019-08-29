
import {readable, writable} from "../store.js";

/**
 *  bufferCount [readable]
 *
 *  Collects n updates from source store and pass them as an array
 *
 *  @params {number} n Number of items to collect before passing to destination store
*/
export function bufferCount(n) {

    return src => writable(undefined, set => {
        let list = [];
        return src.subscribe(value => {
            list.push(value);
            if(list.length === n) {
                set(list);
                list = [];
            }
        });
    });
}

/**
 * bufferTime [readable]
 *
 * @params {number} time Buffer time in milliseconds
*/
export function bufferTime(time) {

    return src => readable(undefined, set => {
        let timeout = null;
        let list = [];
        let unsub = src.subscribe(v => {
            list.push(v);
            if(!timeout) {
                timeout = setInterval(() => {
                    if(list.length) {
                        set(list);
                        list = [];
                    } else {
                        clearInterval(timeout);
                        timeout = null;
                    }
                },time);
            }
        });
        return () => {
            unsub();
            clearInterval(timeout);
        }
    });
}
