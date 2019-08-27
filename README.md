
# Svelte Pipeable Store

[Svelte](https://svelte.dev/) has a rather lovely subscribable store pattern. Beautiful because of its _simplicity_ and _extendability_. 

The core of the pattern is the `writable` store. It has only 3 functions. 
There are `set` and `update` functions to change the store's value 
(I suppose only `update` is strictly needed, but let's not be stingy).
The only required function is `subscribe` which returns an unsubscribe function.

```javascript
writable(value, start) =
{
    subscribe(fn) -> unsubscribe(),
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
If you're trying to observe a permenant state, this can be a problem.
And then having a `complete` and `error` method unnecessarily complicates subscriptions
(try comparing the amount of code in RxJS to Svelte store).
Observables have their purpose, but perhaps not for permenant stores.

However, without wishing to add _too_ much complexity, 
I'd humbly suggest adding one RxJS feature to the Svelte store: a `pipe` method.

## Pipes and Operators

With just a few lines we can add a `pipe` method to `writable` and `readable` stores.

```javascript
function writable(value, start = noop) {
    
    ...
    
    function pipe(...operators) {
        return operators.reduce((src, operator) => operator(src, value), {subscribe});
    }
    return { set, update, subscribe, pipe };
}

function readable(value, start) {
	const {subscribe, pipe} = writable(value, start);
    return {subscribe, pipe}
}

```

The `pipe` method takes one or more Operators. Operators are functions that take a subscribable store and current value and return a store. The minimal requirement for a store are now two methods:

```javascript
store = {
	subscribe(fn) -> unsubscribe()
    pipe(...operators) -> store
}
operator = (store, value) -> store
```

I've created a few example operators, based loosely on RxJS. Let's start simple with
`map`, `filter` and `scan` (analogous to Array.reduce)

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
Other operators shamelessly copied from RxJS include `tap`, `pluck` and `concat`. Operators to limit updates like `skip`, `take` or `bufferCount`, and time-based operations like `bufferTime`, `debounce` and `throttle`.

I'm sure there are more operators to plunder, though a lot of the RxJS operators do seem to be some kind of inner or outer join, to deal with all the complexity that arises from the fact that _Observables Complete_.


## Derivative?

I haven't mentioned yet the `derived` store. Which you could argue performs all of the functions of `pipe`.
Actually it can do a lot more, particularly syncing multiple inputs.
Piped operators provide a more readable, declarative syntax, which is good in-and-of itself.
But I think Operators provide possibilities beyond what `derive stores can do. Leveraging the extendability of the store API, and aiding code reuse.

If we start with the `map` operator, this can be done trivially with a `derived` store:

```javascript
const mapped = derived(count, n => n*3);
```

`filter` can be achieved using a callback with a 2nd `set` function argument
[side note: did you know that `fn.length` returns the number of arguments a function has? Because I did not]

```javascript
const filtered = derived(count, (n, set) => {
    if(n%2 === 0) {
        set(n);
    }
});
```
#### A note on initialisation

When subscribing to a `writable` store, the subscription callback is immediately fired with the current value.
I presume this is because of Svelte's design which immediately subscribes to all referenced stores (eg with `$count`).
Often you have a store with no initial state (like an _authenticated user_). And for any derived store with a filter, you may not want the initial state to fire because it fails the filter function. So I've added one more line to the `writable` subscribe function

```javascript
	if(value !== undefined) {
    	run(value);
    }
```

This doesn't change the behaviour for Svelte, since an uncalled subscription will register as `undefined` anyway.

```javascript
let acc = 0;
const scanned = derived(count, (n, set) => {
	acc = acc + n;
    set(acc);
});
```

Operators like `scan` and `skip(n)` (skip first n subscriptions) can be achieved using an external variable.
`take(n)` (stop after n events) is a little more difficult, since ideally you want to unsubscribe from `count` after n events. I don't know a way to do this with a derived store, though it's not too much bother to code.

More complex operators like `debounce` and `throttle` take advantage of the extendability of stores. Lo-dash's debounce provides `flush()` and `cancel()` methods, so the Operator can too.

```javascript
const debounced = count.pipe(debounce(1000)) ->
{
	subscribe(fn) -> unsubscribe(),
    pipe(...operators),
    flush(),
    cancel(),
}
```

This gets to a more general issue with derived stores. Do they always have to be readonly? Take the `concat` operator, which appends each new value to an array.

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
`concat` is a _writable operator_. It doesn't care if you want to update it's state. Any operators which `derived` would require an external variable like `scan` can assist from being writable. For example being used as an accumulator for the total score, you may want to wipe the score, or deduct points without .

Of course you can reintroduce readonly permission using the handy `readonly` operator : )
```javascript
const score = count.pipe(scan((acc, n) => acc + n, 0));
const read_score = score.pipe(readonly());
```


