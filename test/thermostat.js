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
})
