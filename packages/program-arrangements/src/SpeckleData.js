/**
 * Creates a new instance of SpeckleData.
 * @class
 * @returns An instance of SpeckleData.
 * @example
 * var instance = new SpeckleData();
 */
export default class SpeckleData {

    constructor(settings, streamId) {

        this.streamId = streamId || 'SkdH1zoRX';
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

    getObjects() {
        return new Promise((resolve, reject) => {
            Promise.all([this.objectInfo(), this.streamInfo()]).catch(function (error) {
                console.log(error);
                reject(error);
            }).then(() => {
                const layers = [];
                Object.keys(this.layers).forEach((k) => {
                    const layerInfo = this.layers[k];
                    layerInfo.objectIds.forEach((id, i) => {
                        if (this.objectsById[id]) {
                            layerInfo.objects.push(this.objectsById[id]);
                        } else {
                            console.warn('ID MISMATCH: ' + id);
                        }
                    });
                    layers.push(layerInfo);
                });
                resolve(layers);
            });
        });

    }

    getPolyline(profile) {
        if (profile.type === 'Polyline') {
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
                return {type: 'mesh', faces: obj.faces, vertices: obj.vertices.map((v) => v * this.settings.scale)};
            }
        }
    }

    objectInfo() {
        return fetch(`http://142.93.245.213:3000/api/v1/streams/${this.streamId}/objects/`).then((response) => {
            return response.json();
        }).then((objectInfo) => {
            this.objectsById = {};
            objectInfo.resources.forEach((resource, i) => {
                this.objectsById[resource._id] = resource;
            });
        });
    }

    streamInfo() {
        return fetch(`http://142.93.245.213:3000/api/v1/streams/${this.streamId}`).then((response) => {
            return response.json();
        }).then((streamInfo) => {
            const orderedObjectIds = streamInfo.resource.objects.map((o) => o._id);
            this.layers = {};
            streamInfo.resource.layers.forEach((layer) => {
                let layerInfo = {
                    name: layer.name,
                    objectIds: [],
                    objects: [],
                    color: this.forceHex(layer.properties.color.hex)
                };
                this.layers[layer.name] = layerInfo;
                for (let i = layer.startIndex; i < layer.startIndex + layer.objectCount; i++) {
                    layerInfo.objectIds.push(orderedObjectIds[i]);
                }
            });
        });
    }
}
