'use strict'
/*global console, Promise*/

const assert = require('assert')
const Resp = require('respjs')
const encodeJSON = (val) => Resp.encodeBulk(JSON.stringify(val))
const decodeJSON = (buf) => JSON.parse(buf.toString())

module.exports = function (len) {
  let val = [null, true, false, 0, 'a']
  let bufs = []
  for (let i = 0; i < len; i++) bufs.push(encodeJSON(val))
  bufs = Buffer.concat(bufs)

  return function (done) {
    let resp = new Resp()
    let res = []
    let time = Date.now()

    resp
      .on('data', (buf) => {
        res.push(decodeJSON(buf))
      })
      .on('finish', () => {
        assert.deepEqual(res[res.length - 1], val)
        assert.strictEqual(res.length, len)
        time = Date.now() - time
        console.log((bufs.length / 1024).toFixed(2), 'kb', (len * 1000 / time).toFixed(2), 'ops')
        done()
      })

    let offset = 0
    consumer()
    function consumer () {
      if (offset >= bufs.length) return resp.end()
      resp.write(bufs.slice(offset, offset + 999))
      offset += 999
      process.nextTick(consumer)
    }
  }
}
