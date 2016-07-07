'use strict'
/*global console, Promise*/

const JSBench = require('jsbench')
const len = 1000000 // messages count
const cycles = 5

const jsbench = new JSBench()

jsbench
  .add('Msgp', require('./msgp.js')(len))
  .add('amp', require('./amp.js')(len))
  .add('resp', require('./resp.js')(len))
  // on('cycle', function(e) {console.log(e.name, e.cycle, e.time + 'ms')}).
  .run(cycles)

// JSBench Start, 5 cycles:
// Test Msgp...
// 23437.50 kb 568504.83 ops
// 23437.50 kb 498753.12 ops
// 23437.50 kb 579038.80 ops
// 23437.50 kb 588235.29 ops
// 23437.50 kb 582750.58 ops
// Test amp...
// 27343.75 kb 223313.98 ops
// 27343.75 kb 226963.23 ops
// 27343.75 kb 228937.73 ops
// 27343.75 kb 224466.89 ops
// 27343.75 kb 232180.17 ops
// Test resp...
// 29296.88 kb 669792.36 ops
// 29296.88 kb 589275.19 ops
// 29296.88 kb 659195.78 ops
// 29296.88 kb 657462.20 ops
// 29296.88 kb 613873.54 ops
//
// JSBench Results:
// amp: 5 cycles, 4402.8 ms/cycle, 0.227 ops/sec
// Msgp: 5 cycles, 1782 ms/cycle, 0.561 ops/sec
// resp: 5 cycles, 1571.6 ms/cycle, 0.636 ops/sec
//
// amp: 100%; Msgp: 247.07%; resp: 280.15%;
//
// JSBench Completed!
