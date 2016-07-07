MSGP
====
Byte message protocol for Node.js.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Rust version: https://github.com/iorust/msgp-rust

## Protocol

![Byte message protocol](https://raw.githubusercontent.com/zensh/msgp-node/master/msgp.png)

## Bench
### [1000000 simple messages, amp vs msgp vs resp](https://github.com/zensh/msgp-node/tree/master/bench)

- Mspg: **23437.50 kb 561797.75 ops**
- Amp: **27343.75 kb 212585.03 ops**
- resp: **29296.88 kb 641848.52 ops**

**Amp: 100%; Msgp: 259.64%; Resp: 283.72%**

## API

```js
const Msgp = require('msgp')
```

### Class Msgp
#### new Msgp()
Create a writeable like stream.

```js
const msgp = new Msgp()
```

#### msgp.write(buffer)

```js
msgp.write(Msgp.encode(JSON.stringify({name: 'msgp'})))
```

#### Event: 'data'

```js
msgp.on('data', (buffer) => {
  console.log(JSON.parse(buffer.toString())) // {name: 'msgp'}
})
```

#### Event: 'error'
#### Event: 'drain'
#### Event: 'null'
#### Event: 'finish'

### Class Method: Msgp.encode(string)
### Class Method: Msgp.encode(buffer)
### Class Method: Msgp.decode(buffer)

## License

MIT © [zensh](https://github.com/zensh)

[npm-url]: https://npmjs.org/package/msgp
[npm-image]: http://img.shields.io/npm/v/msgp.svg

[travis-url]: https://travis-ci.org/zensh/msgp-node
[travis-image]: http://img.shields.io/travis/zensh/msgp-node.svg

[downloads-url]: https://npmjs.org/package/msgp
[downloads-image]: http://img.shields.io/npm/dm/msgp.svg?style=flat-square
