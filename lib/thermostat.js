/**
 * Track an infinite curve of values given their inflection points. Or just
 * program a thermostat.
 *
 * See README.md for more information.
 */
'use strict'

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

  // Optimization for horizontal lines.
  if (p1.y === p2.y) {
    return p1.y
  }

  // Standard lerp formula.
  return p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x)
}

/**
 * Helper to validate x values, returning a version coerced to a Number. If
 * coercion is impossible, throws a TypeError.
 */
thermostat.validateX = function (x) {
  if (typeof x === 'string') {
    x = new Date(x)
  }

  x = Number(x)

  if (isNaN(x)) {
    throw new TypeError('Invalid x value: ' + x)
  }

  return x
}

/**
 * Helper to validate y values, returning a version coerced to a Number. If
 * coercion is impossible, throws a TypeError.
 */
thermostat.validateY = function (y) {
  y = Number(y)

  if (isNaN(y)) {
    throw new TypeError('Invalid y value: ' + y)
  }

  return y
}

/**
 * Helper to validate points, returning a clone with valid x and y values. If
 * any of the above is invalid, throws a TypeError.
 */
thermostat.validatePoint = function (params) {
  var point = {}

  if (typeof point !== 'object') {
    throw new TypeError('Invalid point value: ' + point)
  }

  point.x = thermostat.validateX(params.x)
  point.y = thermostat.validateY(params.y)

  return point
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
  points = points.map(function (point) {
    var point = thermostat.validatePoint(point)

    // If the curve repeats, all points should be re-mapped within [0, period).
    if (period) {
      point.x = point.x % period
    }

    return point
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

    if (c === 0) {
      throw new Error('Multiple points exist at x=%s', a.x)
    }

    return c
  })

  // The curve itself. Finally?
  return function curve(x) {
    var p1
    var p2

    x = thermostat.validateX(x)

    // Before we check anything, map `x` into the domain of the curve,
    // [0, period).
    if (period) {
      x = x % period
    }

    // If `x` is out-of-bounds, there are fixed sets of adjacencies.
    if (x < points[0].x) {
      if (period) {
        p1 = { x: points[points.length - 1].x - period, y: points[points.length - 1].y }
        p2 = points[0]
      } else {
        p1 = points[0]
        p2 = points[1]
      }
    } else if (x > points[points.length - 1].x) {
      if (period) {
        p1 = points[points.length - 1]
        p2 = { x: points[0].x + period, y: points[0].y }
      } else {
        p1 = points[points.length - 2]
        p2 = points[points.length - 1]
      }
    // If `x` is in-bounds, search for adjacent points.
    } else {
      p1 = points[0]
      p2 = points[points.length - 1]

      // At this point, `x` must be in-bounds, so search for adjacent points.
      points.some(function (p) {
        if (p.x === x) {
          p1 = p
          p2 = p
          return true
        }

        if (p.x < x) {
          p1 = p
          return false
        }

        // Since `points` is sorted, the first point past `x` must be adjacent.
        // We can bail since we've been tracking `p1`.
        p2 = p
        return true
      })
    }

    // Each run of the curve results in a lerp.
    return thermostat.lerp(p1, p2, x)
  }
}

/*!
 * Export `thermostat`.
 */
module.exports = thermostat
