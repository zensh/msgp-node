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
// 23437.50 kb 632911.39 ops
// 23437.50 kb 546448.09 ops
// 23437.50 kb 661813.37 ops
// 23437.50 kb 611620.80 ops
// 23437.50 kb 623441.40 ops
// Test amp...
// 27343.75 kb 212811.24 ops
// 27343.75 kb 205212.39 ops
// 27343.75 kb 222222.22 ops
// 27343.75 kb 216872.70 ops
// 27343.75 kb 222419.93 ops
// Test resp...
// 29296.88 kb 574382.54 ops
// 29296.88 kb 643086.82 ops
// 29296.88 kb 646412.41 ops
// 29296.88 kb 547345.37 ops
// 29296.88 kb 603500.30 ops
//
// JSBench Results:
// amp: 5 cycles, 4636.2 ms/cycle, 0.216 ops/sec
// resp: 5 cycles, 1666 ms/cycle, 0.600 ops/sec
// Msgp: 5 cycles, 1632.4 ms/cycle, 0.613 ops/sec
//
// amp: 100%; resp: 278.28%; Msgp: 284.01%;
//
// JSBench Completed!
