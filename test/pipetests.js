
import {writable, readable, derived} from '../store.js';

import {expect} from 'chai';

import {
    filter, map, scan, tap, pluck, concat,
    debounce, wait,
    startWith,

} from '../operators/index.js';


function pause(value, time) {
    return new Promise(resolve => setTimeout(() => resolve(value), time));
}


describe('readable operators', () => {

    it('map with multiple pipes', done => {

        let a = writable(0);

        let b = a.pipe(map(x => x * 2)).pipe(map(x => x + 1)).pipe(map(x => `result: ${x}`));
        let c = a.pipe(map(x => x * 2), map(x => x + 1), map(x => `result: ${x}`));

        let blist = [];
        b.subscribe(x => blist.push(x));

        let clist = [];
        c.subscribe(x => clist.push(x));

        a.set(1);
        a.set(2);

        setTimeout(() => {
            expect(blist).to.deep.equal(['result: 1', 'result: 3', 'result: 5']);
            expect(clist).to.deep.equal(['result: 1', 'result: 3', 'result: 5']);
            done();
        }, 100);

    });


    it('filter', done => {

        let a = writable(0);

        let b = a.pipe(filter(x => x % 2 === 0));
        let c = a.pipe(filter(x => x % 2 === 1));

        let blist = [];
        b.subscribe(x => blist.push(x));

        let clist = [];
        c.subscribe(x => clist.push(x));

        a.set(1);
        a.set(2);
        a.set(3);
        a.set(4);
        a.set(5);
        a.set(6);

        setTimeout(() => {
            expect(blist).to.deep.equal([0, 2, 4, 6]);
            expect(clist).to.deep.equal([1, 3, 5]);
            done();
        }, 100);

    });

    it('tap', done => {

        let a = writable(0);

        let blist = [];
        let taplist = [];
        let b = a.pipe(tap(x => taplist.push(x))).pipe(filter(x => x % 2 === 0));
        b.subscribe(x => blist.push(x));

        a.set(1);
        a.set(2);
        a.set(3);
        a.set(4);

        setTimeout(() => {
            expect(blist).to.deep.equal([0, 2, 4]);
            expect(taplist).to.deep.equal([0, 1, 2, 3, 4]);
            done();
        }, 100);

    });

    it('startWith', done => {

        let a = writable(1);

        let blist = [];
        let b = a.pipe(startWith(0));
        b.subscribe(x => blist.push(x));

        a.set(2);
        a.set(3);
        a.set(4);

        setTimeout(() => {
            expect(blist).to.deep.equal([0,1,2,3,4]);
            done();
        }, 100);

    });





});

describe('writable operators', () => {

    it('scan', done => {

        let a = writable(0);

        let b = a.pipe(scan((acc,x) => acc+x, 0));

        let total;
        b.subscribe(x => {
            console.log(`sub ${x}`);
            total = x;
        });

        a.set(1);
        a.set(3);
        a.set(5);
        a.set(11);

        setTimeout(() => {
            expect(total).to.equal(20);
            done();
        },100);
    })

});


describe('tap', () => {


    it('pass all functions', done => {

        let a = writable(0);
        let b = a.pipe(tap(x => console.log(`tap ${x}`)));
        b.subscribe(x => console.log(`sub ${x}`))
        console.log(Object.keys(b));

        done();
    });

});

describe('async operators', () => {

    it('wait no options', done => {

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

    it('wait discard', done => {

        let a = writable(1);
        let b = a.pipe(wait(x => pause(x, x * 100), {discard: true}));
        let res = [];
        b.subscribe(x => {
            console.log(`sub ${x}`);
            res.push(x);
        });
        a.set(3);
        a.set(2);
        a.set(3);
        a.set(5);
        a.set(7);

        setTimeout(() => {
            expect(res).to.deep.equal([7])
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


