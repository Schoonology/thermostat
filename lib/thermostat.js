'use strict'

var assert = require('assert')
var util = require('util')
var thermostat = {}
// One week, in milliseconds.
var WEEK = 7 * 24 * 60 * 60 * 1000

thermostat.lerp = function (p1, p2, x) {
  if (p1.x === p2.x) {
    assert(p1.y === p2.y, 'Cannot lerp on a vertical line (X1 === X2 && Y1 !== Y2).')

    if (x === p1.x) {
      return p1.y
    }

    return NaN
  }

  return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x)
}

thermostat.createCurve = function (options) {
  options = options || {}

  var points = options.points || []
  var period = typeof options.period === 'number' ? options.period : WEEK

  points = points.map(function (point, index) {
    assert(typeof point === 'object', 'Point ' + index + ' is not an object.')

    var clone = util._extend({}, point)

    if (typeof clone.x === 'string') {
      clone.x = new Date(clone.x)
    }

    clone.x = Number(clone.x || 0)
    clone.y = Number(clone.y || 0)

    if (period) {
      clone.x = clone.x % period
      console.log('MOD:', clone.x)
    }

    assert(!isNaN(clone.x), 'Point ' + index + ' has invalid x: ' + point.x)
    assert(!isNaN(clone.y), 'Point ' + index + ' has invalid y: ' + point.y)

    return clone
  })

  if (points.length === 0) {
    return function curve(x) {
      return 0
    }
  }

  if (points.length === 1) {
    return function curve(x) {
      return points[0].y
    }
  }

  points.sort(function (a, b) {
    var c = a.x - b.x

    assert(c !== 0, 'Multiple points exist at x=%s', a.x)

    return c
  })

  console.log('POINTS:', points.map(JSON.stringify))

  return function curve(x) {
    var p1 = points[0]
    var p2 = points[points.length - 1]

    if (typeof x === 'string') {
      x = new Date(x)
    }

    x = Number(x)

    if (!period && x < points[0].x) {
      return thermostat.lerp(points[0], points[1], x)
    }

    if (!period && x > points[points.length - 1].x) {
      return thermostat.lerp(points[points.length - 2], points[points.length - 1], x)
    }

    if (period) {
      x = x % period
    }

    points.forEach(function (p) {
      if (p.x === x) {
        p1 = p
        p2 = p
      }

      if (p.x < x && p.x > p1.x) {
        p1 = p
      }

      if (p.x > x && p.x < p2.x) {
        p2 = p
      }
    })

    if (period && p1.x > x) {
      console.log('P1 > X:', p1, x)
      console.log('P2:', p2)
      p1 = { x: points[points.length - 1].x - period, y: points[points.length - 1].y }
    }

    if (period && p2.x < x) {
      console.log('P2 < X:', p2, x)
      console.log('P1:', p1)
      p2 = { x: points[0].x + period, y: points[0].y }
    }

    console.log('DATA:', p1, p2, x, thermostat.lerp(p1, p2, x))

    return thermostat.lerp(p1, p2, x)
  }
}

module.exports = thermostat
