'use strict'
/*
 * msgp-node: Byte message protocol for Node.js
 * https://github.com/zensh/msgp-node
 *
 * Copyright (c) 2016 Yan Qing
 * Licensed under the MIT license.
 */

const EventEmitter = require('events').EventEmitter
const allocBuffer = Buffer.allocUnsafe || ((size) => new Buffer(size))

class Msgp extends EventEmitter {
  constructor () {
    super()
    // legacy from old stream.
    this.writable = true
    clearState(this)
  }

  static encode (buffer) {
    var buf, offset, len
    let isBuffer = Buffer.isBuffer(buffer)
    if (isBuffer) len = buffer.length
    else if (typeof buffer === 'string') len = Buffer.byteLength(buffer)
    else throw new TypeError('Must be Buffer or String')

    if (len < 128) { // 128
      offset = 1
      buf = allocBuffer(offset + len)
      buf.writeUInt8(len, 0, true)
    } else if (len < 16384) { // 128 * 127 + 128
      offset = 2
      buf = allocBuffer(offset + len)
      buf.writeUInt8(len & 0x7f, 1, true)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0, true)
    } else if (len < 2097152) { // 128 * 128 * 127 + 128 * 127 + 128
      offset = 3
      buf = allocBuffer(offset + len)
      buf.writeUInt8(len & 0x7f, 2, true)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 1, true)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0, true)
    } else if (len < 268435456) { // 128 * 128 * 128 * 127 + 128 * 128 * 127 + 128 * 127 + 128
      offset = 4
      buf = allocBuffer(offset + len)
      buf.writeUInt8(len & 0x7f, 3, true)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 2, true)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 1, true)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0, true)
    } else throw new RangeError('Max buffer length must be small than 268435456')

    if (isBuffer) buffer.copy(buf, offset)
    else buf.write(buffer, offset)
    return buf
  }

  static decode (buffer) {
    if (!Buffer.isBuffer(buffer)) throw new TypeError(String(buffer) + ' is not Buffer object')
    if (!buffer.length) null
    let res = parseBuffer(buffer, 0)
    return res instanceof ParsedResult ? buffer.slice(res.start, res.end) : null
  }

  write (buffer) {
    if (!Buffer.isBuffer(buffer)) {
      this.emit('error', new Error('Invalid buffer chunk'))
      return true
    }

    if (!this._buf) this._buf = buffer
    else {
      let ret = this._buf.length - this._pos
      let concatBuffer = allocBuffer(buffer.length + ret)
      this._buf.copy(concatBuffer, 0, this._pos)
      buffer.copy(concatBuffer, ret)
      this._buf = concatBuffer
      this._msgStart -= this._pos
      this._msgEnd -= this._pos
      this._pos = 0
    }

    while (this._msgEnd <= this._buf.length) {
      if (this._msgStart > this._pos) {
        if (this._msgStart === this._msgEnd) this.emit('null')
        else {
          let buf = this._buf.slice(this._msgStart, this._msgEnd)
          this.emit('data', buf)
        }
        this._pos = this._msgStart = this._msgEnd
      }
      if (this._pos === this._buf.length) {
        clearState(this).emit('drain')
        return true
      }
      let res = parseBuffer(this._buf, this._pos)
      if (res == null) {
        this.emit('drain')
        return true
      }
      if (res instanceof Error) {
        clearState(this).emit('error', res)
        return false
      }
      this._msgStart = res.start
      this._msgEnd = res.end
    }
  }

  end (buffer) {
    if (buffer) this.write(buffer)
    this.emit('finish')
  }
}

function clearState (ctx) {
  ctx._pos = 0
  ctx._msgStart = 0
  ctx._msgEnd = 0
  ctx._buf = null
  return ctx
}

class ParsedResult {
  constructor (start, end) {
    this.start = start
    this.end = end
  }
}

function parseBuffer (buffer, offset) {
  var byte = 0
  var length = 0
  while (true) {
    let len = buffer[offset++]
    if (len < 128) return new ParsedResult(offset, offset + length + len)
    if (++byte >= 4) return new RangeError('Max buffer length must be small than 268435456')
    if (offset >= buffer.length) return null
    length = ((len & 0x7f) + length) * 128
  }
}

module.exports = Msgp
Msgp.Msgp = Msgp
