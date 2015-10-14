# Thermostat

> Track an infinite curve of values given their inflection points. Or just
> program a thermostat.

Thermostat represents an infinite function, `ƒ(d) = ?`, where `d` is a Date or
Number, and `ƒ(d)` returns a Number, interpolating between all of the points
previously added to that function. As I'm not really a math person (honest),
I'll show you what I mean with an example.

Imagine the following curve repeats infinitely (each A is the same as the last):

```
1         C---D
         /     \
0   A---B       A'--
```

If you query a random point on this curve, it should give you a value between
0 and 1. That said, Thermostat (in an attempt to represent this curve as a
function) only cares about A, B, C, and D (and how they repeat).

## API

As usual, Thermostat can be included like so:

```
var thermostat = require('thermostat')
```

### thermostat.lerp(p1, p2, x)

The simple [lerp](lerp) implementation core to the inner-workings of Thermostat,
provided for convenience. `p1` and `p2` are Points (Objects with `x` and `y`
Numbers), returning the Number result of linearly interpolating between those
two points, to `x`.

### curve = thermostat.createCurve(options)

Returns a new Curve instance with the provided `options` Object. The available
options are:

- `period`: _Optional._ The [period](period) of the curve. Set to `0` to
  disable repetition. Defaults to the number of milliseconds in one week.
- `points`: _Optional._ An Array of `{ "x": Number|Date|String, "y": Number }`
  pairs, each of which represents a single point on the curve at `x` with the
  value `y`. Defaults to the empty set which, while valid, isn't very
  interesting: each request returns `0`.

### y = curve(x)

Returns the Number value of the curve at `x`, represented as a Date, Number, or
String.

### A note on inputs

All `x` values can be either Dates, Numbers, or Strings, treated as follows:

- `Number`: Used as-is.
- `Date`: Coerced to a Number as defined by [`Date.valueOf()`](valueOf)
- `String`: Parsed as a Date, then coerced to a Number likewise.

[lerp]: https://en.wikipedia.org/wiki/Linear_interpolation
[period]: https://simple.wikipedia.org/wiki/Periodic_function
[valueOf]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/valueOf
