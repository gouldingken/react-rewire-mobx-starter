import { interpolate } from "flubber";

/**
 * Creates a new instance of ShapeInterpolator.
 * @class
 * @returns An instance of ShapeInterpolator.
 * @example
 * var instance = new ShapeInterpolator();
 */
export default class ShapeInterpolator {//NOTE: was using 'd3-interpolate-path' but results were not very smart, now using flubber

    constructor(path1, path2, closed) {
        this.pathInterpolator = interpolate(ShapeInterpolator.pointsToDataStr(path1, closed), ShapeInterpolator.pointsToDataStr(path2, closed));
    };

    getPath(amount) {
        const pathStr = this.pathInterpolator(amount);
        const commands = pathStr.split(/(?=[LM])/);//Note C not supported
        return commands.map(function(d){
            const pointsArray = d.slice(1, d.length).split(',');
            const pairsArray = [];
            for(let i = 0; i < pointsArray.length; i += 2){
                const x = pointsArray[i].replace(/[^\d.-]/g,'');
                const y = pointsArray[i+1].replace(/[^\d.-]/g,'');
                pairsArray.push([+x, +y]);
            }
            return {x:pairsArray[0][0], y:pairsArray[0][1]};
        });
    }

    static pointsToDataStr(points, closed) {
        let str = '';
        points.forEach((pos, i) => {
            if (i === 0) {
                str = `M${pos.x},${pos.y }`;
            } else {
                str = `${str} L${pos.x},${pos.y }`;
            }
        });
        if (closed) {
            str += 'Z';
        }
        return str;
    }
}
