MSGP
====
Byte message protocol and streaming parser for Node.js.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]

## Rust version: https://github.com/iorust/msgp-rust

## Protocol

![Byte message protocol](https://raw.githubusercontent.com/zensh/msgp-node/master/msgp.png)

## Bench
### [1000000 simple messages, amp vs msgp vs resp](https://github.com/zensh/msgp-node/tree/master/bench)

1. Mspg: **23437.50 kb 661813.37 ops**
2. resp: **29296.88 kb 646412.41 ops**
3. Amp: **27343.75 kb 222419.93 ops**

## API

```js
const Msgp = require('msgp')
```

### Class Msgp
#### new Msgp()
Create a writeable like stream parser.

```js
const msgp = new Msgp()
msgp.on('data', function (data) {
  console.log(data.toString())
})
someSocketStream.pipe(msgp)
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
Encode string or buffer to buffer packet.

```js
Msgp.encode(JSON.stringify({name: 'msgp'}))
// result: <Buffer 0f 7b 22 6e 61 6d 65 22 3a 22 6d 73 67 70 22 7d>
```

### Class Method: Msgp.decode(buffer)
Decode buffer packet to message buffer.

```js
let buf = new Buffer([0x0f, 0x7b, 0x22, 0x6e, 0x61, 0x6d, 0x65, 0x22, 0x3a, 0x22, 0x6d, 0x73, 0x67, 0x70, 0x22, 0x7d])
JSON.parse(Msgp.decode(buf))
// result: {name: 'msgp'}
```

## License

MIT © [zensh](https://github.com/zensh)

[npm-url]: https://npmjs.org/package/msgp
[npm-image]: http://img.shields.io/npm/v/msgp.svg

[travis-url]: https://travis-ci.org/zensh/msgp-node
[travis-image]: http://img.shields.io/travis/zensh/msgp-node.svg

[downloads-url]: https://npmjs.org/package/msgp
[downloads-image]: http://img.shields.io/npm/dm/msgp.svg?style=flat-square
