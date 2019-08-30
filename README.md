
# Svelte Pipeable Store

This is a fork for [Svelte](https://svelte.dev/)'s store, adding a `pipe` method.
Stores can be piped through a number of operators. Synchronous operators include:
`map`, `filter`, `scan`, `pluck`, `concat`, `tap `, `take`, `skip`, `bufferCount`, and `readonly`.
Async operators include `debounce`, `throttle`, `bufferTime` and `wait`.

### Installation

Install with npm:

```sh
npm install 'svelte-pipeable-store';
```

### Usage

Similarish syntax to RxJS. [Read API docs](https://github.com/sprawld/svelte-pipeable-store/blob/master/API.md)

```javascript
import {readable, writable, derived} from 'svelte-pipeable-store';
import {
    map, filter, scan, 
    pluck, concat, tap, take, skip, 
    debounce, throttle, buffer, wait
} from 'svelte-pipeable-store/operators';

const counter = writable(0);
const score = counter.pipe(filter(n => n%2 === 0))      // only odd scores count
                     .pipe(scan((acc,n) => acc + n, 0));// add to total

const score_sheet = score.pipe(
    map(n => `total: ${n}`),                            // you can put multiple
    concat()                                            // operators in one call to pipe
);

const score_elem = score.pipe(                          // if a store's state can update quickly 
    debounce(500),                                      // you can use async operators to slow down updates
    throttle(2000)                                      // particularly if your pipeline has a bottleneck
    wait(score => fetch(`/endpoint?score=${score}`))    // eg ajax, large DOM updates (or if they have transitions)
)
```

Currently this is a speculative project (feedback welcome!)
But I think `pipe` is a useful addition to Svelte's store pattern.
Here's my pitch for why it should be added:

## My Pitch

I'm a big fan of [Svelte's](https://svelte.dev/) subscribable store pattern.
The two aspect I like: its _simplicity_ and _extendability_. 

The core of the pattern is the `writable` store. It has only 3 functions. 
There are `set` and `update` functions to change the store's value 
(I suppose only `update` is strictly needed, but let's not be stingy).
The only required function is `subscribe` which returns an unsubscribe function.

```javascript
writable(value, start) =
{
    subscribe(fn), // returns unsubscribe()
    set(value),
    update(fn)
}
```

The simplicity extends to the [svelte store source](https://github.com/sveltejs/svelte/blob/master/src/runtime/store/index.ts)
which is very _lean_ (I can't think of a better word). There is a `readable` store - which is just a custom writable store with only the subscribe method.
From the source:

```javascript
function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe,
	};
}
``` 

Since `subscribe` is all we need, the pattern lends itself to creating stores with custom accessors.
Most examples use a counter, but there are all sorts of uses

```javascript
user = {
    subscribe(fn) -> unsubscribe(),
    login(webtoken),
    logout(),
    setPreferences(options)
}
```

This API is very reminiscent of Observables from [RxJS](https://github.com/ReactiveX/rxjs) _but with important differences_.
In the store
[RFC](https://github.com/sveltejs/rfcs/blob/master/text/0002-reactive-stores.md#relationship-with-tc39-observables)
Rich Harris lays out his reasons. The main one, at least for me, being _Observables Complete_. 
If you're trying to observe a permenant state, this can be a problem if you need to resubscribe.
Even if not, you've got unnecessary `complete` and `error` methods complicating your subscription model.
(try comparing the amount of code in RxJS to Svelte store).
Observables have their purpose, but perhaps not for permenant stores.

However, without wishing to add _too_ much complexity and completely contradict everything I've just said,  
I'd humbly suggest adding one RxJS feature to the Svelte store: **a `pipe` method**.

## Pipes and Operators

With just a few lines we can add a `pipe` method to `writable` and `readable` stores (and therefore `derived`).

```javascript
function writable(value, start = noop) {
    
    ...
    
    function pipe(...operators) {
        return operators.reduce((src, operator) => operator(src), this);
    }
    return { set, update, subscribe, pipe };
}

function readable(value, start) {
    const {subscribe, pipe} = writable(value, start);
    return {subscribe, pipe}
}

```

The `pipe` method takes one or more _Operators_.
Operators are functions that take a (source) store and return a (destination) store.
The minimal requirement for a store are now two methods `subscribe` and `pipe`:

```javascript
Store = {
    subscribe(fn) -> unsubscribe()
    pipe(...operators) -> Store
}
Operator = Store -> Store
```

I've created a few example operators, based loosely on RxJS. Let's start simple with
`map`, `filter` and `scan` (analogous to Array.reduce).
I'll go back to the traditional counter example:

```javascript
import {writable} from 'store';
import {map, filter, scan} from 'store/operators';

const count = writable(0);

const score = count.pipe(map(n => n*3));
const total = score.pipe(
    filter(n => n%2 === 0),
    scan((acc,n) => acc + n, 0)
);

score.subscribe(n => console.log(`score: ${n}`)); // score: 0
total.subscribe(n => console.log(`total: ${n}`)); // total: 0

count.set(1); // score: 3
count.set(2); // score: 6  total: 6
count.set(3); // score: 9
count.set(4); // score: 12  total 18

```
Other operators shamelessly copied from RxJS include `tap`, `pluck` and `concat`.
Operators to limit updates like `skip`, `take`, 
and time-based operations like `buffer`, `debounce` and `throttle`.
I also created a `wait` operator to deal with async operations.

I'm sure there are more operators to plunder from RxJS. 
Though many (`flatMap`/`switchMap`) of the RxJS operators seem to be some kind of inner or outer join, 
to deal with all the complexities that arise when _Observables Complete_.


## Derivative?

I haven't mentioned yet the `derived` store. Which you could argue performs all of the functions of `pipe`.
Actually it can do a lot more: particularly allowing multiple inputs.

Piped operators provide a more readable, declarative syntax, which is good in-and-of itself.
And while `pipe` adds little extra weight codebase, a toolkit of Operators does.
Alternatively users could be asked to write their own,
but then why wouldn't you use a `derived` store?

I'm going to argue that piped operators provide helpful function encapsulation & pattern reuse. 
It retains the simplicity of the original store API, while allowing space for some extensions.
And that a few useful patterns (at least `map`,`filter` and `scan`, `debounce` and `wait`) 
are worthy of providing out-of-the-box.

If we start with the `map` operator, this can be done trivially with a `derived` store:

```javascript
const mapped = derived(count, n => n*3);
```

`filter` can be achieved using a callback with a 2nd `set` function argument
(side note: did you know that `fn.length` returns the number of arguments a function has? Because I did not)

```javascript
const filtered = derived(count, (n, set) => {
    if(n%2 === 0) {
        set(n);
    }
});
```



On to slightly more complicated operators:

```javascript
let acc = 0;
const scanned = derived(count, (n, set) => {
    acc = acc + n;
    set(acc);
});
```

Operators like `scan` (and `concat`, `take` and `skip`)
can all be achieved with reference external variable outside the derived store.
Operators aren't saving much code yet, though it's worth considering
how you would export the `scanned` store (more on that in a moment).



With the `debounce` and `throttle` operators there's a chance for extension.
Lo-dash's debounce provides `flush()` and `cancel()` methods.
But since an operator returns a store it can add whatever custom methods it likes.

```javascript
const debounced = count.pipe(debounce(1000)) ->
{
    subscribe(fn),      // returns unsubscribe(),
    pipe(...operators), // returns store
    flush(),
    cancel(),
}
```

One last complex operator to highlight encapsulation.
Without lodash to crib off I wrote my own `wait` operator (as such I have no idea if the code's particularly good).
The `wait` operator awaits a Promise before updating the destination store.
It maintains a queue, so that older updates don't overwrite newer results if they resolve first.
This also allows options to run in series (`queue`), wait for pending Promises then perform last one only (`exhaust`)
or ignore the result from pending Promises (`discard`) 

```javascript
const user = writable({id:'default'});
const avatar = user.pipe(pluck('id'))
                   .pipe(wait(id => fetch(`/profiles/${id}.png`)));
```

Extended stores get to a more general issue with derived stores: they're readonly.
This makes perfect sense, the derived store is meant to reflect the up-to-date state of all its source stores
(run through a transform function).

This is not the same when we have an external variable.
Take the `concat` operator, which appends each new value to an array.

```javascript

const all = count.pipe(concat());

all.subscribe(console.log); // [0]
count.set(1); // [0,1]
count.set(2); // [0,1,2]
count.set(3); // [0,1,2,3]
```

What if I want to clear the list? The `concat` operator can provide a `clear()` method:

```javascript
function concat() -> {
    subscribe, pipe,
    clear()
    set, update
}
```

Actually, the `clear` method is a shorthand, since the `writable` store methods `set` and `update` are included too.
`concat` is a _writable operator_. It doesn't care if you want to filter it's list or overwrite it.

Concat is perhaps too narrowly defined an operator, since it's just scan (specifically `scan((acc,item) => [...acc, item])`).
`scan` contains the core principle: an external variable updated by an iterator.

A fully writable store may be too permissive, but you can reintroduce readonly permission with the `readonly` operator:

```javascript
const score = count.pipe(scan((acc, n) => acc + n, 0));
const read_score = score.pipe(readonly());
// equivalent:
const read_native = score.pipe(({subscribe, pipe}) => ({subscribe, pipe}));
```

Readonly is so simple, you can also write your own operator as a one-liner.
Yes, pipes also provide a handy way to create custom stores : )

```javascript
const user = writable({});
const custom = user.pipe(({subscribe, pipe, set, update}) => ({
    subscribe, pipe,
    changeName(name) {
        update(user => ({...user, name}));
    },
    logout() {
        set({});
    }
}));
```

#### A note on initialisation

When subscribing to a `writable` store, the subscription callback is immediately fired with the current value.
I presume this is because of Svelte's design which immediately subscribes to all referenced stores (eg with `$count`).
Often you have a store with no initial state (like an _authenticated_ user store).
For any derived store with a filter, the initial state may not pass the filter function, so you certainly don't want it fire.
To address this I've added one more line to the `writable` subscribe function

```javascript
    if(value !== undefined) {
        run(value);
    }
```

This doesn't change the behaviour for Svelte, since an uncalled subscription will register as `undefined` anyway.

