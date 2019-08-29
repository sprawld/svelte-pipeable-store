
## API

## Readable Stores

Return a readable store `{ subscribe, pipe }`

#### map(iterator)

Destination store is updated with transformed value

- `iterator(value) => transformed_value` mapping function 

#### filter(iterator)

Destination store is updated when filter function returns `true`

- `iterator(value) => Boolean` filter function

#### pluck(key)

- `key` string of key to pluck

#### startWith(value)

Whenever a subscription is made, its first value is `value`

- `value` initial value for subscription

#### withLatestFrom(...sources)

Whenever source store updates, the destination store updates with an array containing the source store value,
followed by the current value of all `sources` stores provided.
Only the source store triggers an update.

- `sources` one or more source stores.

#### readonly

No arguments. Converts any store into a read only store

## Writable Operators

These return a writable store. `{ subscribe, pipe, set, update }`

#### scan(iterator, accumulator)

Destination store's state is an accumulator value.
When the source store updates the iterator is provided the current accumulator and new value,
and returns the new accumulator

- `iterator(accumulator, value) => accumulator` 
- `accumulator` initial value

#### concat

No arguments. Adds each updated value to an array.
Probably pointless since it's trivial to do with `scan` and not the same as RxJS's `concat`

#### bufferCount(n)

Wait for `n` updates of the source store, then update the destination store with an array of all the values.

- `n` size of buffer

## Clearable Operators

Returns readable operators, but with a clear method to reset the operator.
`{ subscribe, pipe, clear }`

#### take(n)

Returns only first n items

- `n` number of updates to accept

#### skip(n)

Ignores first n items

- `n` number of updates to accept


### Cloning operator

#### tap(iterator)

Listen to pipeline (and produce side effects).
Passes all functions of source operator

- `iterator(value) => void`

### Async Operators

#### debounce(time, options)

Lodash debounce.

Returns `{subscribe, pipe, flush, cancel}`

- `time` debounce time in ms
- `options` options object
  - `leading` trigger on leading edge
  - `trailing` trigger on trailing edge

#### throttle(time, options)

- `time` wait between updates
- `options` debounce options

#### bufferTime(time)

Collect updates from the source store over `time` ms and send all updates in an array.

- `time` time window in ms

#### wait(iterator, options)

Wait for an async function (Promise or promise-like) to complete before updating store
Options are available to specify behaviour when many requests occur at once
In all cases the destination store will not be passed results out of sequence
and will eventually update to the final (correct) state

- `iterator` Maps the src store to a Promise
- `options` Options object
  - `queue = false` If true run iterator in series.
Even with queue as false the operator will not update when there is already a newer item
  - `exhaust = false` If true when a promise is pending, subsequent calls are ignored.
Trailing call will be performed at the end to ensure piped store is eventually up-to-date
  - `discard = false` If true, when the src subscription fires, pending Promises are ignored.
  - `error` Error handing function.
Note if you want errors to return a value to the destination store, you should add a catch block to your Promise.

### Generators

Not pipeable operators, but ways of create subscribable stores.

#### merge(...stores)

Takes one or more source stores. Whenever any source updates,
its value is passed to the destination store.

- `...stores` one or more source subscribable stores

#### zip(stores)

- `stores` Array or Object of stores.

Either an Array of stores - the destination store has an array of values,
or an Object, where the destination store will have values in the matching keys.

```javascript
zip({
    user: userStore,
    messages: messageStore,
    preferences: preferenceStore
})
```
