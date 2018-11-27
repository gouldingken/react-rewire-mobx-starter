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

    getTweenPathObject(path1, path2, color, depth) {
        const obj4 = {
            tweenPaths: [],
            z: 10,
            depth: depth,
            color: color
        };

        const interpolator = new ShapeInterpolator(path1, path2, true);

        let steps = 20;
        for (let i = 0; i <= steps; i++) {
            obj4.tweenPaths.push(interpolator.getPath(i / steps));
        }

        return obj4;

    }

    getExtrudeObjects() {
        const path1 = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 10}, {x: 0, y: 10}];
        const path2 = [{x: 20, y: 20}, {x: 15, y: 20}, {x: 15, y: 15}, {x: 10, y: 15}, {x: 10, y: 10}, {x: 20, y: 10}];
        const path3 = [{x: 20, y: 20}, {x: 10, y: 20}, {x: 10, y: 10}, {x: 20, y: 10}];
        const path4 = [{x: 22.071068, y: 15}, {x: 18.535534, y: 18.535534}, {x: 15, y: 15}, {
            x: 11.464466,
            y: 18.535534
        }, {x: 7.9289322, y: 15}, {x: 15, y: 7.9289322}];
        const path5 = [{x: 11.25, y: 6.9822331}, {x: 16.25, y: 6.9822331}, {x: 16.25, y: 11.982233}, {
            x: 21.25,
            y: 11.982233
        }, {x: 21.25, y: 16.982233}, {x: 11.25, y: 16.982233}];

        const paths = [path1, path2, path3, path4, path5];

        const colors = ["#cec77a",
            "#9e44d6",
            "#71d54f",
            "#d549c8",
            "#cad544",
            "#5b60e1",
            "#d89836",
            "#b070d3",
            "#7ad898",
            "#d64993",
            "#538942",
            "#d84058",
            "#50cdcd",
            "#d24f26",
            "#6790d3",
            "#8b7230",
            "#7756a1",
            "#d07960",
            "#d992cc",
            "#a54c66"];

        const ans = [];
        for (let j = 0; j < 2; j++) {
            for (let i = 0; i < colors.length; i++) {
                const a = Math.floor(Math.random() * (paths.length));
                const b = Math.floor(Math.random() * (paths.length));
                ans.push(this.getTweenPathObject(paths[a], paths[b], colors[i], i / 2));
            }

        }

        return ans;
    }
}
