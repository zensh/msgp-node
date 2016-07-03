'use strict'

const assert = require('assert')
const tman = require('tman')
const Msgp = require('..')
const createBuf = Buffer.allocUnsafe ? Buffer.from : (value, a, b) => new Buffer(value, a, b)
const allocBuffer = Buffer.allocUnsafe
  ? (size) => Buffer.allocUnsafe(size)
  : (size) => new Buffer(size)

tman.suite('Msgp.encode(buffer)', function () {
  tman.it('should throw TypeError with non-buffer', function () {
    assert.throws(() => Msgp.encode(), TypeError)
    assert.throws(() => Msgp.encode(null), TypeError)
    assert.throws(() => Msgp.encode(1), TypeError)
    assert.throws(() => Msgp.encode({}), TypeError)
  })

  tman.it('should ok when buffer.length === 0', function () {
    assert.ok(Msgp.encode(createBuf([])).equals(createBuf([0x0])))
  })

  tman.it('should ok when buffer.length < 128', function () {
    assert.ok(Msgp.encode(createBuf([0x1, 0x2])).equals(createBuf([0x2, 0x1, 0x2])))
    assert.ok(Msgp.encode(createBuf('abcd')).equals(createBuf([0x4, 0x61, 0x62, 0x63, 0x64])))

    let encodeBuf = Msgp.encode(allocBuffer(127).fill('a'))
    assert.ok(encodeBuf.equals(Buffer.concat([createBuf([0x7f]), allocBuffer(127).fill('a')])))
  })

  tman.it('should ok when buffer.length == 128', function () {
    let encodeBuf = Msgp.encode(allocBuffer(128).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x00]), allocBuffer(128).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should ok when buffer.length < 16384', function () {
    let encodeBuf = Msgp.encode(allocBuffer(129).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x01]), allocBuffer(129).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))

    encodeBuf = Msgp.encode(allocBuffer(16383).fill('a'))
    targetBuf = Buffer.concat([createBuf([0xff, 0x7f]), allocBuffer(16383).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should ok when buffer.length == 16384', function () {
    let encodeBuf = Msgp.encode(allocBuffer(16384).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x80, 0x00]), allocBuffer(16384).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should ok when buffer.length < 2097152', function () {
    let encodeBuf = Msgp.encode(allocBuffer(16385).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x80, 0x01]), allocBuffer(16385).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))

    encodeBuf = Msgp.encode(allocBuffer(2097151).fill('a'))
    targetBuf = Buffer.concat([createBuf([0xff, 0xff, 0x7f]), allocBuffer(2097151).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should ok when buffer.length == 2097152', function () {
    let encodeBuf = Msgp.encode(allocBuffer(2097152).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x80, 0x80, 0x00]),
      allocBuffer(2097152).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should ok when buffer.length < 268435456', function () {
    let encodeBuf = Msgp.encode(allocBuffer(2097153).fill('a'))
    let targetBuf = Buffer.concat([createBuf([0x81, 0x80, 0x80, 0x01]),
      allocBuffer(2097153).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))

    encodeBuf = Msgp.encode(allocBuffer(268435455).fill('a'))
    targetBuf = Buffer.concat([createBuf([0xff, 0xff, 0xff, 0x7f]),
      allocBuffer(268435455).fill('a')])
    assert.ok(encodeBuf.equals(targetBuf))
  })

  tman.it('should throw RangeError when buffer.length >= 268435456', function () {
    assert.throws(() => Msgp.encode(allocBuffer(268435456).fill('a')), RangeError)
    assert.throws(() => Msgp.encode(allocBuffer(268435457).fill('a')), RangeError)
  })
})

tman.suite('Msgp.decode(buffer)', function () {
  tman.it('should throw TypeError with non-buffer', function () {
    assert.throws(() => Msgp.decode(), TypeError)
    assert.throws(() => Msgp.decode(null), TypeError)
    assert.throws(() => Msgp.decode(1), TypeError)
    assert.throws(() => Msgp.decode({}), TypeError)
    assert.throws(() => Msgp.decode(createBuf([])), Error)
  })

  tman.it('should ok when buffer.length === 0', function () {
    let res = Msgp.decode(Msgp.encode(createBuf([])))
    assert.ok(res.equals(createBuf([])))
  })

  tman.it('should ok when buffer.length < 128', function () {
    let res = Msgp.decode(Msgp.encode(createBuf('abcd')))
    assert.ok(res.equals(createBuf('abcd')))

    res = Msgp.decode(Msgp.encode(allocBuffer(127).fill('a')))
    assert.ok(res.equals(allocBuffer(127).fill('a')))
  })

  tman.it('should ok when buffer.length == 128', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(128).fill('a')))
    assert.ok(res.equals(allocBuffer(128).fill('a')))
  })

  tman.it('should ok when buffer.length < 16384', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(129).fill('a')))
    assert.ok(res.equals(allocBuffer(129).fill('a')))

    res = Msgp.decode(Msgp.encode(allocBuffer(16383).fill('a')))
    assert.ok(res.equals(allocBuffer(16383).fill('a')))
  })

  tman.it('should ok when buffer.length == 16384', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(16384).fill('a')))
    assert.ok(res.equals(allocBuffer(16384).fill('a')))
  })

  tman.it('should ok when buffer.length < 2097152', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(16385).fill('a')))
    assert.ok(res.equals(allocBuffer(16385).fill('a')))

    res = Msgp.decode(Msgp.encode(allocBuffer(2097151).fill('a')))
    assert.ok(res.equals(allocBuffer(2097151).fill('a')))
  })

  tman.it('should ok when buffer.length == 2097152', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(2097152).fill('a')))
    assert.ok(res.equals(allocBuffer(2097152).fill('a')))
  })

  tman.it('should ok when buffer.length < 268435456', function () {
    let res = Msgp.decode(Msgp.encode(allocBuffer(2097153).fill('a')))
    assert.ok(res.equals(allocBuffer(2097153).fill('a')))

    res = Msgp.decode(Msgp.encode(allocBuffer(268435455).fill('a')))
    assert.ok(res.equals(allocBuffer(268435455).fill('a')))
  })

  tman.it('should throw Error when buffer.length >= 268435456', function () {
    let buf = Buffer.concat([createBuf([0xff, 0xff, 0xff, 0x7f]),
      allocBuffer(268435456).fill('a')])
    assert.throws(() => Msgp.decode(buf), Error)

    buf = Buffer.concat([createBuf([0x81, 0x80, 0x80, 0x80, 0x00]),
      allocBuffer(268435456).fill('a')])
    assert.throws(() => Msgp.decode(buf), RangeError)
  })

  tman.it('should throw Error when valid buffer', function () {
    let buf = Buffer.concat([createBuf([0x81]), allocBuffer(16383).fill('a')])
    assert.throws(() => Msgp.decode(buf), Error)
  })
})

tman.suite('Class Msgp', function () {
  const encodeJSON = (val) => Msgp.encode(createBuf(JSON.stringify(val)))
  const decodeJSON = (buf) => JSON.parse(buf.toString())

  tman.it('new Msgp()', function (done) {
    let result = []
    let msgp = new Msgp()

    msgp
      .on('data', (buf) => {
        result.push(decodeJSON(buf))
      })
      .on('finish', () => {
        assert.deepEqual(result, ['0', '2', '', '中文', [], [[]], ['set', 'key', '123']])
        done()
      })

    msgp.write(encodeJSON(0))
    msgp.write(encodeJSON('2'))
    msgp.write(encodeJSON(''))
    msgp.write(encodeJSON('中文'))
    msgp.write(encodeJSON([]))
    msgp.write(encodeJSON([[]]))
    msgp.write(encodeJSON(['set', 'key', 123]))
    msgp.end()
  })

  tman.it('new Msgp(): Pipelining data', function (done) {
    let result = []
    let msgp = new Msgp()

    msgp
      .on('data', (buf) => {
        result.push(decodeJSON(buf))
      })
      .on('finish', () => {
        assert.deepEqual(result, ['中文', '', 123])
        done()
      })

    let buf = Buffer.concat([encodeJSON('中文'), encodeJSON(''), encodeJSON(123)])
    msgp.write(buf.slice(0, 3))
    msgp.write(buf.slice(3, 7))
    msgp.write(buf.slice(7))
    msgp.end()
  })
})
