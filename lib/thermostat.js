/**
 * Track an infinite curve of values given their inflection points. Or just
 * program a thermostat.
 *
 * See README.md for more information.
 */
'use strict'

var assert = require('assert')
var util = require('util')
var thermostat = {}
// One week, in milliseconds.
var WEEK = 7 * 24 * 60 * 60 * 1000

/**
 * Interpolate over the line from `p1` to `p2`, returning expected value for
 * `y`, given `x`. `p1` and `p2` should both be Objects with (at least) two
 * properties, `x` and `y`.
 */
thermostat.lerp = function (p1, p2, x) {
  // Assertions for vertical lines.
  if (p1.x === p2.x) {
    if (p1.y !== p2.y) {
      return NaN
    }

    // If p1 and p2 are the same, the "interpolation" only makes sense at that
    // point, and should be that value.
    if (x === p1.x) {
      return p1.y
    }

    return NaN
  }

  // Standard lerp formula.
  return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x)
}

/**
 * Returns a new Curve instance with the provided `options` Object. The
 * available options are:
 *
 * - `period`: _Optional._ The [period](period) of the curve. Set to `0` to
 *   disable repetition. Defaults to the number of milliseconds in one week.
 * - `points`: _Optional._ An Array of `{ "x": Number|Date|String, "y":
 *   Number }` pairs, each of which represents a single point on the curve at
 *   `x` with the value `y`. Defaults to the empty set which, while valid,
 *   isn't very interesting: each request returns `0`.
 */
thermostat.createCurve = function (options) {
  options = options || {}

  var points = options.points || []
  var period = typeof options.period === 'number' ? options.period : WEEK

  // Validate points, resolving them to Number,Number pairs. See README for
  // more information about the coercion process.
  points = points.map(function (point, index) {
    assert(typeof point === 'object', 'Point ' + index + ' is not an object.')

    var clone = util._extend({}, point)

    if (typeof clone.x === 'string') {
      clone.x = new Date(clone.x)
    }

    clone.x = Number(clone.x || 0)
    clone.y = Number(clone.y || 0)

    // If the curve repeats, all points should be re-mapped within [0, period).
    if (period) {
      clone.x = clone.x % period
      console.log('MOD:', clone.x)
    }

    assert(!isNaN(clone.x), 'Point ' + index + ' has invalid x: ' + point.x)
    assert(!isNaN(clone.y), 'Point ' + index + ' has invalid y: ' + point.y)

    return clone
  })

  // Optimization for zero points: a horizontal line at y = 0.
  if (points.length === 0) {
    return function curve(x) {
      return 0
    }
  }

  // Optimization for a single point: a horizontal line at y = x1.
  if (points.length === 1) {
    return function curve(x) {
      return points[0].y
    }
  }

  // Numerical sort to optimize finding points adjacent to `x`.
  points.sort(function (a, b) {
    var c = a.x - b.x

    assert(c !== 0, 'Multiple points exist at x=%s', a.x)

    return c
  })

  console.log('POINTS:', points.map(JSON.stringify))

  // The curve itself. Finally?
  return function curve(x) {
    var p1 = points[0]
    var p2 = points[points.length - 1]

    if (typeof x === 'string') {
      x = new Date(x)
    }

    x = Number(x)

    // If `x` is out-of-bounds of a non-repeating curve, then lerp over the
    // closest two.
    if (!period && x < points[0].x) {
      return thermostat.lerp(points[0], points[1], x)
    }

    if (!period && x > points[points.length - 1].x) {
      return thermostat.lerp(points[points.length - 2], points[points.length - 1], x)
    }

    // If the curve _does_ repeat, however, re-map `x` within [0, period).
    if (period) {
      x = x % period
    }

    // Search for adjacent points.
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

    // If `x` is out-of-bounds of a repeating curve, then lerp over the last
    // and first points, respectively.
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

    // Each run of the curve results in a lerp.
    return thermostat.lerp(p1, p2, x)
  }
}

/*!
 * Export `thermostat`.
 */
module.exports = thermostat
