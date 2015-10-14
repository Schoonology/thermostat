'use strict'

var thermostat = {}

thermostat.lerp = function (p1, p2, x) {
  return p1.x + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x)
}

module.exports = thermostat
