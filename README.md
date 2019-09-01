
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

[I've also made a REPL with an example counter](https://svelte.dev/repl/df4cbb0aaac44b769a3cbeed0cb0af59?version=3.9.1)

Similarish syntax to RxJS. [Read the API docs](https://github.com/sprawld/svelte-pipeable-store/blob/master/API.md)

