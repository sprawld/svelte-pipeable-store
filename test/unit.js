
import {writable} from '../store.js';

import {expect} from 'chai';

import {
    filter, map, scan, tap, wait, startWith, zip
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
            expect(res).to.deep.equal([1,2,3,4]);
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
            expect(res).to.deep.equal([7]);
            done();
        }, 1500);
    });

});

describe('generators', () => {

    it('zip Object', done => {

        let a = writable(1);
        let b = writable('a');

        let c = zip({a,b});
        let clist = [];

        c.subscribe(x => clist.push(x));

        a.set(2);
        b.set('b');

        setTimeout(() => {
            expect(clist).to.deep.equal([
                {a:1, b:'a'},
                {a:2, b:'a'},
                {a:2, b:'b'}
            ]);
            done();
        },100);


    })

});
