'use strict'
/*
 * msgp-node: Byte message protocol for Node.js
 * https://github.com/zensh/msgp-node
 *
 * Copyright (c) 2016 Yan Qing
 * Licensed under the MIT license.
 */

const EventEmitter = require('events').EventEmitter
const allocBuffer = Buffer.allocUnsafe
  ? (size) => Buffer.allocUnsafe(size)
  : (size) => new Buffer(size)

class Msgp extends EventEmitter {
  constructor () {
    super()
    // legacy from old stream.
    this.writable = true
    clearState(this)
  }

  static encode (buffer) {
    if (!Buffer.isBuffer(buffer)) throw new TypeError(String(buffer) + ' is not Buffer object')
    let buf = null
    let len = buffer.length
    if (len < 128) { // 128
      buf = allocBuffer(1 + len)
      buf.writeUInt8(len, 0)
      buffer.copy(buf, 1)
      return buf
    }
    if (len < 16384) { // 128 * 127 + 128
      buf = allocBuffer(2 + len)
      buf.writeUInt8(len & 0x7f, 1)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0)
      buffer.copy(buf, 2)
      return buf
    }
    if (len < 2097152) { // 128 * 128 * 127 + 128 * 127 + 128
      buf = allocBuffer(3 + len)
      buf.writeUInt8(len & 0x7f, 2)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 1)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0)
      buffer.copy(buf, 3)
      return buf
    }
    if (len < 268435456) { // 128 * 128 * 128 * 127 + 128 * 128 * 127 + 128 * 127 + 128
      buf = allocBuffer(4 + len)
      buf.writeUInt8(len & 0x7f, 3)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 2)
      len >>>= 7
      buf.writeUInt8(len & 0x7f | 0x80, 1)
      len >>>= 7
      buf.writeUInt8(len | 0x80, 0)
      buffer.copy(buf, 4)
      return buf
    }
    throw new RangeError('Max buffer length must be small than 268435456(256 MB)')
  }

  static decode (buffer) {
    if (!Buffer.isBuffer(buffer)) throw new TypeError(String(buffer) + ' is not Buffer object')
    if (!buffer.length) throw new Error('Invalid buffer chunk')
    let res = parseBuffer(buffer, 0)
    if (res && res.end === buffer.length) return buffer.slice(res.start)
    throw res instanceof Error ? res : new Error('Parse "' + buffer.inspect() + '" failed')
  }

  write (buffer) {
    if (!Buffer.isBuffer(buffer) || !buffer.length) {
      this.emit('error', new Error('Invalid buffer chunk'))
      return true
    }

    if (!this._buf) this._buf = buffer
    else {
      let ret = this._buf.length - this._offset
      let concatBuffer = allocBuffer(buffer.length + ret)
      this._buf.copy(concatBuffer, 0, this._offset)
      buffer.copy(concatBuffer, ret)
      this._buf = concatBuffer
      this._msgStart -= this._offset
      this._msgEnd -= this._offset
      this._offset = 0
    }

    while (this._msgEnd <= this._buf.length) {
      if (this._msgStart > this._offset) {
        let buf = this._buf.slice(this._msgStart, this._msgEnd)
        this._offset = this._msgStart = this._msgEnd
        this.emit('data', buf)
        continue
      }
      if (this._offset === this._buf.length) {
        clearState(this).emit('drain')
        return true
      }
      let res = parseBuffer(this._buf, this._offset)
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
      if (this._msgStart === this._msgEnd) {
        this._offset = this._msgStart
        this.emit('null')
      }
    }
  }

  end (buffer) {
    if (buffer) this.write(buffer)
    this.emit('finish')
  }
}

module.exports = Msgp
Msgp.Msgp = Msgp

function clearState (ctx) {
  ctx._offset = 0
  ctx._msgStart = 0
  ctx._msgEnd = 0
  ctx._buf = null
  return ctx
}

class ParsedResult {
  constructor (start, length) {
    this.start = start
    this.end = start + length
  }
}

function parseBuffer (buffer, offset) {
  let len = 0
  let byte = 0
  let length = 0
  do {
    len = buffer.readUInt8(offset + byte++)
    if (len < 128) break
    length = ((len & 0x7f) + length) * 128
  } while (byte < 4 && (offset + byte) < buffer.length)

  if (len < 128) return new ParsedResult(offset + byte, length + len)
  if (byte < 4) return null
  return new RangeError('Max buffer length must be small than 268435456(256 MB)')
}
