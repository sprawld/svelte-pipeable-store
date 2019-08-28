
## API

## Readable Stores

Return `subscribe` and `pipe` methods only

#### map(iterator)

Destination store is updated with transformed value

- `iterator(value) => transformed` mapping function 

Returns a readable store

#### filter(iterator)

Destination store is updated when filter function returns `true`

- `iterator(value) => Boolean` filter function

#### pluck(key)

- `key` string of key to pluck

#### readonly

No arguments. Converts any store into a read only store

## Writable Operators

These return a writable store with `set` and `update` functions

#### scan(iterator, accumulator)

Destination store's state is an accumulator value.
When the source store updates the iterator is provided the current accumulator and new value,
and returns the new accumulator

- `iterator(accumulator, value) => accumulator` 
- `accumulator` initial value

#### concat

No arguments. Adds each updated value to an array.
Probably pointless since it's trivial to do with `scan` and not the same as RxJS's `concat`

#### take()

Returns only first

#### skip



#### tap(iterator)

Listen to pipeline (and produce side effects).
Passes all functions of source operator

- `iterator(value) => void`

#### debounce
#### throttle
#### bufferCount
#### bufferTime
#### bufferWhen
#### wait
#### merge
#### zip
#### startWith
#### withLatestFrom
