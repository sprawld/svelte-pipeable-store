
import {writable, readable, derived} from '../store.js';

import {expect} from 'chai';
// import {filter, map, scan, tap, pluck, wait, debounce, concat, take, skip} from '../operators.js';
// import {filter, map, scan, tap, pluck, concat, debounce} from '../operators2.js';
import {filter, map, scan, tap, pluck, concat, debounce, wait} from '../operators/index.js';

function pause(value, time) {
    return new Promise(resolve => setTimeout(() => resolve(value), time));
}

describe('tap', () => {


    it('pass all functions', done => {

        let a = writable(0);
        let b = a.pipe(tap(x => console.log(`tap ${x}`)));
        b.subscribe(x => console.log(`sub ${x}`))
        console.log(Object.keys(b));

        done();
    });

});
describe('wait', () => {


    it('wait for promise', done => {

        let a = writable(1);
        let b = a.pipe(wait(x => pause(x, x * 100)));
        let res = [];
        b.subscribe(x => {
            console.log(`sub ${x}`);
            res.push(x);
        });
        a.set(3);
        a.set(2);
        a.set(3);
        a.set(5);
        a.set(4);

        setTimeout(() => {
            expect(res).to.deep.equal([1,2,3,4])
            done();
        }, 1500);
    });

});


describe('pipeable store', () => {


    it('derived only', done => {

        let a = writable(1);

        let b = derived(a, (n, set) => {
            if(n%2 === 0) {
                set(n);
            }
        });

        b.subscribe(console.log);
        a.set(2);
        a.set(3);
        setTimeout(done,1000);
    });

    it('should output stuff', done => {



        let a = writable(0);

        let b = a.pipe(map(x => x*3)).pipe(tap(x => console.log(`tap: ${x}`)));
// let b = a.pipe(map(x => x*3)).pipe(map(x => x));
// let b = a.pipe(tap(x => console.log(`tap: ${x}`)));

        let c = a.pipe(filter(x => x%2));//, tap(x => console.log(`tap2 ${x}`)));

        let d = a.pipe(concat());

        let e = a.pipe(debounce(1200));

        let sublist = [
            a.subscribe(x => console.log(`a: ${x}`)),
            b.subscribe(x => console.log(`b (map *3): ${x}`)),
            c.subscribe(x => console.log(`c (filter): ${x}`)),
            d.subscribe(x => console.log(`d (concat): ${x && x.join()}`)),
            e.subscribe(x => console.log(`e (debounce): ${x}`)),
        ];

        let interval;
        let i = 0;
        interval = setInterval(() => {
            i++;
            if(i > 5) {
                clearInterval(interval);
                // e.cancel();
                setTimeout(() => {
                    // e.flush();
                    sublist.forEach(s => s());
                    done();
                },10);
                return;
            }
            if(i%3 === 0) {
                d.clear();
                console.log('flush');
                e.flush();
            }
            a.set(i);
        },300);

    });

});


