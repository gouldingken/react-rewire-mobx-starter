/**
 * Creates a new instance of Maf.
 * @class
 * @returns An instance of Maf.
 * @example
 * var instance = new Maf();
 */
export default class Maf {

    constructor() {//https://github.com/spite/Maf.js/blob/master/Maf.js
    };

    // Current version.
    static VERSION = '1.0.0';

    static PI = Math.PI;

    // https://www.opengl.org/sdk/docs/man/html/clamp.xhtml

    static clamp(v, minVal, maxVal) {
        return Math.min(maxVal, Math.max(minVal, v));
    };

    // https://www.opengl.org/sdk/docs/man/html/step.xhtml

    static step(edge, v) {
        return (v < edge) ? 0 : 1;
    }

    // https://www.opengl.org/sdk/docs/man/html/smoothstep.xhtml

    static smoothStep(edge0, edge1, v) {
        const t = Maf.clamp((v - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    };

    // http://docs.unity3d.com/ScriptReference/Mathf.html
    // http://www.shaderific.com/glsl-functions/
    // https://www.opengl.org/sdk/docs/man4/html/
    // https://msdn.microsoft.com/en-us/library/windows/desktop/ff471376(v=vs.85).aspx
    // http://moutjs.com/docs/v0.11/math.html#map
    // https://code.google.com/p/kuda/source/browse/public/js/hemi/utils/mathUtils.js?r=8d581c02651077c4ac3f5fc4725323210b6b13cc

    // Converts from degrees to radians.
    static deg2Rad(degrees) {
        return degrees * Math.PI / 180;
    };

    static toRadians = Maf.deg2Rad;

    // Converts from radians to degrees.
    static rad2Deg(radians) {
        return radians * 180 / Math.PI;
    };

    static toDegrees = Maf.rad2Deg;

    static clamp01(v) {
        return this.clamp(v, 0, 1);
    };

    // https://www.opengl.org/sdk/docs/man/html/mix.xhtml

    static mix(x, y, a) {
        if (a <= 0) return x;
        if (a >= 1) return y;
        return x + a * (y - x)
    };

    static lerp() {
        return Maf.mix(x, y, a);
    }

    static inverseMix(a, b, v) {
        return (v - a) / (b - a);
    };

    static inverseLerp = Maf.inverseMix;

    static mixUnclamped(x, y, a) {
        if (a <= 0) return x;
        if (a >= 1) return y;
        return x + a * (y - x)
    };

    static lerpUnclamped = Maf.mixUnclamped;

    // https://www.opengl.org/sdk/docs/man/html/fract.xhtml

    static fract(v) {
        return v - Math.floor(v);
    };

    static frac = Maf.fract;

    // http://stackoverflow.com/questions/4965301/finding-if-a-number-is-a-power-of-2

    static isPowerOfTwo(v) {
        return (((v - 1) & v) === 0);
    };

    // https://bocoup.com/weblog/find-the-closest-power-of-2-with-javascript

    static closestPowerOfTwo(v) {
        return Math.pow(2, Math.round(Math.log(v) / Math.log(2)));
    };

    static nextPowerOfTwo(v) {
        return Math.pow(2, Math.ceil(Math.log(v) / Math.log(2)));
    }

    // http://stackoverflow.com/questions/1878907/the-smallest-difference-between-2-angles

    //function mod(a, n) { return a - Math.floor(a/n) * n; }
    static mod(a, n) {
        return (a % n + n) % n;
    }

    static deltaAngle(a, b) {
        let d = Maf.mod(b - a, 360);
        if (d > 180) d = Math.abs(d - 360);
        return d;
    };

    static deltaAngleDeg = Maf.deltaAngle;

    static deltaAngleRad(a, b) {
        return Maf.toRadians(Maf.deltaAngle(Maf.toDegrees(a), Maf.toDegrees(b)));
    };

    static lerpAngle(a, b, t) {
        const angle = Maf.deltaAngle(a, b);
        return Maf.mod(a + this.lerp(0, angle, t), 360);
    };

    static lerpAngleDeg = Maf.lerpAngle;

    static lerpAngleRad(a, b, t) {
        return Maf.toRadians(Maf.lerpAngleDeg(Maf.toDegrees(a), Maf.toDegrees(b), t));
    };

    // http://gamedev.stackexchange.com/questions/74324/gamma-space-and-linear-space-with-shader

    static gammaToLinearSpace(v) {
        return Math.pow(v, 2.2);
    };

    static linearToGammaSpace(v) {
        return Math.pow(v, 1 / 2.2);
    };

    static map(from1, to1, from2, to2, v) {
        return from2 + (v - from1) * (to2 - from2) / (to1 - from1);
    }

    static scale = Maf.map;

    // http://www.iquilezles.org/www/articles/functions/functions.htm

    static almostIdentity(x, m, n) {

        if (x > m) return x;

        const a = 2 * n - m;
        const b = 2 * m - 3 * n;
        const t = x / m;

        return (a * t + b) * t * t + n;
    }

    static impulse(k, x) {
        const h = k * x;
        return h * Math.exp(1 - h);
    };

    static cubicPulse(c, w, x) {
        x = Math.abs(x - c);
        if (x > w) return 0;
        x /= w;
        return 1 - x * x * (3 - 2 * x);
    }

    static expStep(x, k, n) {
        return Math.exp(-k * Math.pow(x, n));
    }

    static parabola(x, k) {
        return Math.pow(4 * x * (1 - x), k);
    }

    static powerCurve(x, a, b) {
        const k = Math.pow(a + b, a + b) / (Math.pow(a, a) * Math.pow(b, b));
        return k * Math.pow(x, a) * Math.pow(1 - x, b);
    }

    // http://iquilezles.org/www/articles/smin/smin.htm ?

    static latLonToCartesian(lat, lon) {

        lon += 180;
        lat = this.clamp(lat, -85, 85);
        const phi = Maf.toRadians(90 - lat);
        const theta = Maf.toRadians(180 - lon);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);

        return {x: x, y: y, z: z}

    }

    static cartesianToLatLon(x, y, z) {
        const n = Math.sqrt(x * x + y * y + z * z);
        return {lat: Math.asin(z / n), lon: Math.atan2(y, x)};
    }

    static randomInRange(min, max) {
        return min + Math.random() * (max - min);
    }

    static norm(v, minVal, maxVal) {
        return (v - minVal) / (maxVal - minVal);
    }

    static hash(n) {
        return Maf.fract((1.0 + Math.cos(n)) * 415.92653);
    }

    static noise2d(x, y) {
        const xhash = Maf.hash(x * 37.0);
        const yhash = Maf.hash(y * 57.0);
        return Maf.fract(xhash + yhash);
    }

    // http://iquilezles.org/www/articles/smin/smin.htm

    static smoothMin(a, b, k) {
        const res = Math.exp(-k * a) + Math.exp(-k * b);
        return -Math.log(res) / k;
    }

    static smoothMax(a, b, k) {
        return Math.log(Math.exp(a) + Math.exp(b)) / k;
    }

    static almost(a, b) {
        return (Math.abs(a - b) < .0001);
    }
}