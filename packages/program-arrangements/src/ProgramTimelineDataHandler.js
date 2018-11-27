import {ADataHandler} from "colorizer-three";
import ShapeInterpolator from "./ShapeInterpolator";
import SpeckleData from "./SpeckleData";

/**
 * Creates a new instance of ProgramTimelineDataHandler.
 * @class
 * @returns An instance of ProgramTimelineDataHandler.
 * @example
 * var instance = new ProgramTimelineDataHandler();
 */
export default class ProgramTimelineDataHandler extends ADataHandler {

    constructor() {
        super();

        this.colorLookup = {};
        const colorPalette = {};
    };

    getColor(id) {
        return this.colorLookup[id] || super.getColor(id);
    }

    setTime(time) {
        if (time < 1) return;


    }

    get useExtrudes() {
        return true;
    }

    getTweenPathObject(path1, path2, color, depth, offset, z = 0) {
        const tweenPathObj = {
            tweenPaths: [],
            offset: offset,
            z: z,
            depth: depth,
            color: color
        };

        const interpolator = new ShapeInterpolator(path1, path2, true);

        let steps = 20;
        for (let i = 0; i <= steps; i++) {
            tweenPathObj.tweenPaths.push(interpolator.getPath(i / steps));
        }

        return tweenPathObj;

    }

    getPathObject(path, color, depth, offset, z = 0) {
        return {
            path: path,
            offset: offset,
            z: z,
            depth: depth,
            color: color
        };
    }


    getExtrudeObjects(callback) {
        let speckleData = new SpeckleData({scale: 0.1});
        const ans = [];

        speckleData.getObjects().then((layers) => {

            const objectPairs = {};
            const colors = {};
            layers.forEach((layer, i) => {
                const bits = layer.name.split('::');
                const optionName = bits[0];
                const programName = bits[1];
                if (programName === 'other') {
                    if (optionName === 'option1') {
                        layer.objects.forEach((obj, i) => {
                            const extrusion = speckleData.getExtrusion(obj);
                            if (extrusion) {
                                ans.push(this.getPathObject(extrusion.polyline, layer.color, extrusion.height, 0, extrusion.z));
                            }
                        });
                    }
                } else {
                    if (!objectPairs[programName]) {
                        objectPairs[programName] = {};
                    }
                    colors[programName] = layer.color;
                    objectPairs[programName][optionName] = layer.objects[0];
                }
            });

            Object.keys(objectPairs).forEach((name) => {
                const pair = objectPairs[name];

                const extrusion1 = speckleData.getExtrusion(pair.option1);
                const extrusion2 = speckleData.getExtrusion(pair.option2);
                ans.push(this.getTweenPathObject(extrusion1.polyline, extrusion2.polyline, colors[name], extrusion1.height, 0, extrusion1.z));
            });

            let offset = 0;//used to minimize z-fighting
            ans.sort((a, b) => a.depth - b.depth);
            ans.forEach((tweenObj, i) => {
                tweenObj.offset = i * 0.25;
            });
            callback(ans);
        });
    }
}
