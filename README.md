
# Svelte Pipeable Store

This is a fork for [Svelte](https://svelte.dev/)'s store, adding a `pipe` method.
Stores can be piped through a number of operators. Synchronous operators include:
`map`, `filter`, `scan`, `pluck`, `concat`, `tap `, `take`, `skip`, `startWith`, `withLatestFrom`, `bufferCount`, and `readonly`.
Async operators include `debounce`, `throttle`, `bufferTime` and `wait`.

### Installation

Install with npm:

```sh
npm install 'svelte-pipeable-store';
```

### Usage

[I've also made a REPL with an example counter](https://svelte.dev/repl/df4cbb0aaac44b769a3cbeed0cb0af59?version=3.9.1)

```javascript
import {
    writable,
    map, filter, scan, 
    pluck, concat, tap, take, skip, 
    debounce, throttle, buffer, wait
} from 'svelte-pipeable-store';

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


I've made a few operators, still Similarish syntax to RxJS. [API docs](https://github.com/sprawld/svelte-pipeable-store/blob/master/API.md)

## Pipes

With just a few lines to Svelte's store can add a `pipe` method to `writable` and `readable` stores.

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

