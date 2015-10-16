var test = require('tape')
var thermostat = require('../')

test('thermostat.lerp(p1, p2, x)', function (suite) {
  var p1 = { x: 1, y: 1 }
  var p2 = { x: 3, y: 2 }

  suite.test('interpolates between two points', function (t) {
    t.equal(thermostat.lerp(p1, p2, 2), 1.5)
    t.end()
  })

  suite.test('interpolates before two points', function (t) {
    t.equal(thermostat.lerp(p1, p2, 0), 0.5)
    t.end()
  })

  suite.test('interpolates after two points', function (t) {
    t.equal(thermostat.lerp(p1, p2, 4), 2.5)
    t.end()
  })

  suite.test('given x1, returns y1', function (t) {
    t.equal(thermostat.lerp(p1, p2, p1.x), p1.y)
    t.end()
  })

  suite.test('given x2, returns y2', function (t) {
    t.equal(thermostat.lerp(p1, p2, p2.x), p2.y)
    t.end()
  })

  suite.test('returns NaN if p1.x === p2.x && p1.y !== p2.y', function (t) {
    t.ok(isNaN(thermostat.lerp.bind(
      null,
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      1
    )))
    t.end()
  })

  suite.test('returns NaN if p1.x === p2.x and x !== p1.x', function (t) {
    t.ok(isNaN(thermostat.lerp(
      { x: 1, y: 3 },
      { x: 1, y: 3 },
      2
    )))
    t.end()
  })

  suite.test('returns p1.y if p1.x === p2.x and x === p1.x', function (t) {
    t.equal(thermostat.lerp(
      { x: 1, y: 3 },
      { x: 1, y: 3 },
      1
    ), 3)
    t.end()
  })
})

test('thermostat.createCurve(options)', function (suite) {
  suite.test('given nothing, returns a function', function (t) {
    t.ok(typeof thermostat.createCurve() === 'function')
    t.end()
  })

  suite.test('given an objection, returns a function', function (t) {
    t.ok(typeof thermostat.createCurve({}) === 'function')
    t.end()
  })

  suite.test('throws if a Point is not an Object', function (t) {
    t.throws(thermostat.createCurve.bind(null, { points: ['string'] }))
    t.throws(thermostat.createCurve.bind(null, { points: [42] }))
    t.throws(thermostat.createCurve.bind(null, { points: [true] }))
    t.throws(thermostat.createCurve.bind(null, { points: [null] }))
    t.throws(thermostat.createCurve.bind(null, { points: [undefined] }))
    t.end()
  })

  suite.test('throws if a Point.y cannot be a Number', function (t) {
    t.throws(thermostat.createCurve.bind(null, { points: [{ x: 0, y: 'string' }] }))
    t.end()
  })

  suite.test('does not mutate points', function (t) {
    var p1 = { x: 0, y: new Date() }
    var p2 = { x: 21, y: 0 }

    thermostat.createCurve({ points: [p1, p2], period: 10 })

    t.equal(p1.y, p1.y)
    t.equal(p2.x, p2.x)
    t.end()
  })
})

test('curve(x)', function (suite) {
  var POINTS = [
    { x: 1, y: 0 }, // A
    { x: 3, y: 0 }, // B
    { x: 5, y: 1 }, // C
    { x: 7, y: 1 }  // D
  ]
  var PERIOD = 8

  suite.test('interpolates between A & B', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(2), 0)
    t.end()
  })

  suite.test('interpolates between B & C', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(4), 0.5)
    t.end()
  })

  suite.test('interpolates between C & D', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(6), 1)
    t.end()
  })

  suite.test('interpolates between D & A', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(8), 0.5)
    t.end()
  })

  suite.test('given B.x, returns B.y', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(3), 0)
    t.end()
  })

  suite.test('given C.x, returns C.y', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: PERIOD
    })

    t.equal(curve(5), 1)
    t.end()
  })

  suite.test('before A.x (no period), returns A.y', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: 0
    })

    t.equal(curve(0), 0)
    t.end()
  })

  suite.test('after D.x (no period), returns D.y', function (t) {
    var curve = thermostat.createCurve({
      points: POINTS,
      period: 0
    })

    t.equal(curve(8), 1)
    t.end()
  })

  suite.test('defaults to a period of one week', function (t) {
    var week = (new Date('Oct 13 2015') - new Date('Oct 20 2015'))
    var curve = thermostat.createCurve({
      points: [
        { x: Math.random(), y: 0 },
        { x: Math.random(), y: 1 }
      ]
    })
    var x

    x = Math.random() * week
    t.equal(curve(x), curve(x + week))
    x = Math.random() * week
    t.equal(curve(x), curve(x + week))
    x = Math.random() * week
    t.equal(curve(x), curve(x + week))
    x = Math.random() * week
    t.equal(curve(x), curve(x + week))
    t.end()
  })

  suite.test('defaults to the origin', function (t) {
    var curve = thermostat.createCurve()

    t.equal(curve(1000), 0)
    t.end()
  })

  suite.test('with no points, behaves like the defaults', function (t) {
    var curve = thermostat.createCurve({
      points: []
    })

    t.equal(curve(1000), 0)
    t.end()
  })

  suite.test('with one point, always returns P.y', function (t) {
    var curve = thermostat.createCurve({
      points: [
        { x: 0, y: 42 }
      ]
    })

    t.equal(curve(1000), 42)
    t.end()
  })

  suite.test('with two points and no period, behaves like lerp', function (t) {
    var p1 = { x: 1, y: 1 }
    var p2 = { x: 3, y: 2 }
    var curve = thermostat.createCurve({
      points: [p1, p2],
      period: 0
    })

    t.test('interpolates between two points', function (st) {
      st.equal(curve(2), 1.5)
      st.end()
    })

    t.test('interpolates before two points', function (st) {
      st.equal(curve(0), 0.5)
      st.end()
    })

    t.test('interpolates after two points', function (st) {
      st.equal(curve(4), 2.5)
      st.end()
    })

    t.test('given x1, returns y1', function (st) {
      st.equal(curve(p1.x), p1.y)
      st.end()
    })

    t.test('given x2, returns y2', function (st) {
      st.equal(curve(p2.x), p2.y)
      st.end()
    })
  })

  suite.test('with out-of-period points, wraps', function (t) {
    var curve = thermostat.createCurve({
      points: [
        { x: 4, y: 0 },
        { x: 16, y: 1 }
      ],
      period: 10
    })

    t.equal(curve(5), 0.5)
    t.end()
  })
})

test('curve(d)', function (suite) {
  suite.test('should accept dates', function (t) {
    var curve = thermostat.createCurve({
      points: [
        { x: 'Oct 13 2015', y: 0 },
        { x: 'Oct 15 2015', y: 1 }
      ]
    })

    t.equal(curve('Oct 14 2015'), 0.5)
    t.end()
  })
})
