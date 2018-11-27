import {ADataHandler} from "colorizer-three";
import ShapeInterpolator from "./ShapeInterpolator";

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

    getExtrudeObjects() {
        const obj1 = {
            path: [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}],
            z: 0,
            depth: 10,
            color: '#ff0000'
        };
        const obj2 = {
            path: [{x: 20, y: 20}, {x: 15, y: 20}, {x: 15, y: 15}, {x: 10, y: 15}, {x: 10, y: 10}, {x: 20, y: 10}],
            z: 10,
            depth: 10,
            color: '#ffff00'
        };
        const obj3 = {
            path: [{x: 20, y: 20}, {x: 10, y: 20}, {x: 10, y: 10}, {x: 20, y: 10}],
            z: 10,
            depth: 10,
            color: '#c5ff58'
        };

        const path4 = [{x: 22.071068, y: 15}, {x: 18.535534, y: 18.535534}, {x: 15, y: 15}, {
            x: 11.464466,
            y: 18.535534
        }, {x: 7.9289322, y: 15}, {x: 15, y: 7.9289322}];
        const path5 = [{x: 11.25, y: 6.9822331}, {x: 16.25, y: 6.9822331}, {x: 16.25, y: 11.982233}, {
            x: 21.25,
            y: 11.982233
        }, {x: 21.25, y: 16.982233}, {x: 11.25, y: 16.982233}];

        const obj4 = {
            tweenPaths: [],
            z: 10,
            depth: 10,
            color: '#ff7df3'
        };

        const interpolator = new ShapeInterpolator(path4, path5, true);

        let steps = 20;
        for (let i = 0; i <= steps; i++) {
            obj4.tweenPaths.push(interpolator.getPath(i / steps));
        }

        return [obj4];
    }
}
