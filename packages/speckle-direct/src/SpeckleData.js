/**
 * Creates a new instance of SpeckleData.
 * @class
 * @returns An instance of SpeckleData.
 * @example
 * var instance = new SpeckleData();
 */
export default class SpeckleData {

    constructor(settings) {
        this.settings = settings || {scale: 1};
    };

    forceHex(colour) {
        const colours = {
            "aliceblue": "#f0f8ff",
            "antiquewhite": "#faebd7",
            "aqua": "#00ffff",
            "aquamarine": "#7fffd4",
            "azure": "#f0ffff",
            "beige": "#f5f5dc",
            "bisque": "#ffe4c4",
            "black": "#000000",
            "blanchedalmond": "#ffebcd",
            "blue": "#0000ff",
            "blueviolet": "#8a2be2",
            "brown": "#a52a2a",
            "burlywood": "#deb887",
            "cadetblue": "#5f9ea0",
            "chartreuse": "#7fff00",
            "chocolate": "#d2691e",
            "coral": "#ff7f50",
            "cornflowerblue": "#6495ed",
            "cornsilk": "#fff8dc",
            "crimson": "#dc143c",
            "cyan": "#00ffff",
            "darkblue": "#00008b",
            "darkcyan": "#008b8b",
            "darkgoldenrod": "#b8860b",
            "darkgray": "#a9a9a9",
            "darkgreen": "#006400",
            "darkkhaki": "#bdb76b",
            "darkmagenta": "#8b008b",
            "darkolivegreen": "#556b2f",
            "darkorange": "#ff8c00",
            "darkorchid": "#9932cc",
            "darkred": "#8b0000",
            "darksalmon": "#e9967a",
            "darkseagreen": "#8fbc8f",
            "darkslateblue": "#483d8b",
            "darkslategray": "#2f4f4f",
            "darkturquoise": "#00ced1",
            "darkviolet": "#9400d3",
            "deeppink": "#ff1493",
            "deepskyblue": "#00bfff",
            "dimgray": "#696969",
            "dodgerblue": "#1e90ff",
            "firebrick": "#b22222",
            "floralwhite": "#fffaf0",
            "forestgreen": "#228b22",
            "fuchsia": "#ff00ff",
            "gainsboro": "#dcdcdc",
            "ghostwhite": "#f8f8ff",
            "gold": "#ffd700",
            "goldenrod": "#daa520",
            "gray": "#808080",
            "green": "#008000",
            "greenyellow": "#adff2f",
            "honeydew": "#f0fff0",
            "hotpink": "#ff69b4",
            "indianred ": "#cd5c5c",
            "indigo": "#4b0082",
            "ivory": "#fffff0",
            "khaki": "#f0e68c",
            "lavender": "#e6e6fa",
            "lavenderblush": "#fff0f5",
            "lawngreen": "#7cfc00",
            "lemonchiffon": "#fffacd",
            "lightblue": "#add8e6",
            "lightcoral": "#f08080",
            "lightcyan": "#e0ffff",
            "lightgoldenrodyellow": "#fafad2",
            "lightgrey": "#d3d3d3",
            "lightgreen": "#90ee90",
            "lightpink": "#ffb6c1",
            "lightsalmon": "#ffa07a",
            "lightseagreen": "#20b2aa",
            "lightskyblue": "#87cefa",
            "lightslategray": "#778899",
            "lightsteelblue": "#b0c4de",
            "lightyellow": "#ffffe0",
            "lime": "#00ff00",
            "limegreen": "#32cd32",
            "linen": "#faf0e6",
            "magenta": "#ff00ff",
            "maroon": "#800000",
            "mediumaquamarine": "#66cdaa",
            "mediumblue": "#0000cd",
            "mediumorchid": "#ba55d3",
            "mediumpurple": "#9370d8",
            "mediumseagreen": "#3cb371",
            "mediumslateblue": "#7b68ee",
            "mediumspringgreen": "#00fa9a",
            "mediumturquoise": "#48d1cc",
            "mediumvioletred": "#c71585",
            "midnightblue": "#191970",
            "mintcream": "#f5fffa",
            "mistyrose": "#ffe4e1",
            "moccasin": "#ffe4b5",
            "navajowhite": "#ffdead",
            "navy": "#000080",
            "oldlace": "#fdf5e6",
            "olive": "#808000",
            "olivedrab": "#6b8e23",
            "orange": "#ffa500",
            "orangered": "#ff4500",
            "orchid": "#da70d6",
            "palegoldenrod": "#eee8aa",
            "palegreen": "#98fb98",
            "paleturquoise": "#afeeee",
            "palevioletred": "#d87093",
            "papayawhip": "#ffefd5",
            "peachpuff": "#ffdab9",
            "peru": "#cd853f",
            "pink": "#ffc0cb",
            "plum": "#dda0dd",
            "powderblue": "#b0e0e6",
            "purple": "#800080",
            "rebeccapurple": "#663399",
            "red": "#ff0000",
            "rosybrown": "#bc8f8f",
            "royalblue": "#4169e1",
            "saddlebrown": "#8b4513",
            "salmon": "#fa8072",
            "sandybrown": "#f4a460",
            "seagreen": "#2e8b57",
            "seashell": "#fff5ee",
            "sienna": "#a0522d",
            "silver": "#c0c0c0",
            "skyblue": "#87ceeb",
            "slateblue": "#6a5acd",
            "slategray": "#708090",
            "snow": "#fffafa",
            "springgreen": "#00ff7f",
            "steelblue": "#4682b4",
            "tan": "#d2b48c",
            "teal": "#008080",
            "thistle": "#d8bfd8",
            "tomato": "#ff6347",
            "turquoise": "#40e0d0",
            "violet": "#ee82ee",
            "wheat": "#f5deb3",
            "white": "#ffffff",
            "whitesmoke": "#f5f5f5",
            "yellow": "#ffff00",
            "yellowgreen": "#9acd32"
        };

        if (typeof colours[colour.toLowerCase()] !== 'undefined')
            return colours[colour.toLowerCase()];

        return colour;
    }

    getPolyline(profile) {
        if (profile.type === 'Polyline') {//TODO consolidate with getCurve
            const polyline = [];
            //path line can be in either direction, so we normalize to always extruding UP
            for (let i = 2; i < profile.value.length; i += 3) {
                let x = profile.value[i - 2] * this.settings.scale;
                let y = profile.value[i - 1] * this.settings.scale;
                polyline.push({x: x, y: y});
                // z = profile.value[i] * this.settings.scale;
            }
            return polyline;
        } else if (profile.type === 'Polycurve') {
            const polyline = [];
            for (let i = 0; i < profile.segments.length; i++) {
                const segment = profile.segments[i];
                // console.log(segment.type+': '+segment.value.join(','));
                let x = segment.value[0] * this.settings.scale;
                let y = segment.value[1] * this.settings.scale;
                polyline.push({x: x, y: y});
            }
            return polyline;
        }
    }

    getExtrusion(obj, log) {
        if (!obj) {
            console.log('No object passed');
            return;
        }
        if (obj.type === 'Extrusion') {
            if (obj.profile) {
                const polyline = this.getPolyline(obj.profile);
                if (polyline) {
                    //path line can be in either direction, so we normalize to always extruding UP
                    let z = this.settings.scale * Math.min(obj.pathStart.value[2], obj.pathEnd.value[2]);
                    return {
                        polyline: polyline,
                        z: z,
                        height: obj.length * this.settings.scale,
                    };
                }
            }
        }
    }

    getMesh(obj) {
        if (obj.type === 'Mesh') {
            if (obj.faces && obj.vertices) {
                return {
                    type: 'mesh',
                    color: obj.colors[0] || '#ff0000',
                    faces: obj.faces,
                    vertices: obj.vertices.map((v) => v * this.settings.scale)
                };
            }
        }
        if (obj.type === 'Brep' && obj.displayValue) {
            return this.getMesh(obj.displayValue);
        }
    }

    getLine(obj) {
        const scale = (v) => {
            return this.settings.scale * v;
        };
        if (obj.value) {
            const vertices = [];
            vertices.push([scale(obj.value[0]), scale(obj.value[1]), scale(obj.value[2])]);
            vertices.push([scale(obj.value[3]), scale(obj.value[4]), scale(obj.value[5])]);
            return {type: 'line', vertices: vertices};
        }
    }

    getCurves(obj) {
        if (obj.type === 'Line') {
            return [this.getLine(obj)];
        } else if (obj.type === 'Polycurve') {
            if (obj.segments) {
                return obj.segments.map((seg) => this.getLine(seg));
            }
        } else if (obj.type === 'Polyline') {
            const curves = {type: 'curves', curves: []};
            const vertices = [];
            for (let i = 2; i < obj.value.length; i += 3) {
                let x = obj.value[i - 2] * this.settings.scale;
                let y = obj.value[i - 1] * this.settings.scale;
                let z = obj.value[i] * this.settings.scale;
                vertices.push([x, y, z]);
                // z = profile.value[i] * this.settings.scale;
            }
            for (let i = 0; i < vertices.length - 1; i++) {
                const vertexA = vertices[i];
                const vertexB = vertices[i + 1];
                curves.curves.push({type: 'line', vertices: [vertexA, vertexB]});
            }
            curves.curves.push({type: 'line', vertices: [vertices[vertices.length - 1], vertices[0]]});

            return curves;
        } else {
            console.log('Unsupported type: ' + obj.type);
        }
    }
}
