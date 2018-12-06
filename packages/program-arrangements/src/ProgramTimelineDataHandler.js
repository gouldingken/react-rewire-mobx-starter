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

    static colorProgram(name) {
        switch (name) {
            case 'Basketball Course': return '#fffffb';
            case 'Locker': return '#f9705f';
            case 'Sport Medicine': return '#ffca78';
            case 'VIP/Meeting': return '#fff984';
            case 'Office': return '#c4b5d3';
            case 'Strength&Conditioning': return '#f985a6';
        }

        return '#b3ceec';
    }

    get useExtrudes() {
        return true;
    }

    getTweenPathObject(path1, path2, color, offset, fromZ, toZ, fromDepth, toDepth) {
        const tweenPathObj = {
            tweenPaths: [],
            offset: offset,
            fromZ: fromZ,
            toZ: toZ,
            fromDepth: fromDepth,
            toDepth: toDepth,
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
            color: color,
            hatch: true
        };
    }


    getExtrudeObjects(callback) {
        // let speckleData = new SpeckleData({scale: 0.1});
        const testObjectStream = 'SkSB07V14';
        const optionsStream = 'rysHaUmJE';
        let speckleData = new SpeckleData({scale: 0.1}, optionsStream);//'r16RQMMJE'
        const ans = [];

        speckleData.getObjects().then((layers) => {

            const objectPairs = {};
            const colors = {};
            layers.forEach((layer, i) => {
                console.log('LAYER: ' + layer.name);
                const bits = layer.name.split('::');
                const optionName = bits[0];
                const programName = bits[1];
                const partName = bits[2] || '1';
                if (!programName) {
                    if (optionName === 'Exisiting Arch') {//typo matches Rhino
                        layer.objects.forEach((obj, i) => {
                            const extrusion = speckleData.getExtrusion(obj);
                            if (extrusion) {
                                ans.push(this.getPathObject(extrusion.polyline, layer.color, extrusion.height, 0, extrusion.z));
                            }
                            const mesh = speckleData.getMesh(obj);
                            if (mesh) {
                                mesh.color = layer.color;
                                ans.push(mesh);
                            }
                        });
                    }
                } else {
                    if (!objectPairs[programName]) {
                        objectPairs[programName] = {};
                    }
                    if (!objectPairs[programName][optionName]) {
                        objectPairs[programName][optionName] = {};
                    }
                    colors[programName] = layer.color;

                    objectPairs[programName][optionName][partName] = layer.objects[0];
                }
            });

            const options = {
                'Existing': 'Existing',
                'Option 2': 'Option 2',
                'Option 3': 'Option 3',
                'Option 4': 'Option 4',
            };

            Object.keys(objectPairs).forEach((name) => {
                console.log('---' + name);

                const pair = objectPairs[name];

                let optionKeys = Object.keys(options);
                for (let i = 0; i < optionKeys.length; i++) {
                    for (let j = i + 1; j < optionKeys.length; j++) {
                        // console.log(optionKeys[i] + ' -> ' + optionKeys[j]);
                        const aKey = optionKeys[i];
                        const bKey = optionKeys[j];
                        if (pair[aKey] && pair[bKey]) {
                            Object.keys(pair[aKey]).forEach((partId) => {
                                const logVerbose = false;//name + '_' + partId === 'Strength&Conditioning_2';
                                const extrusion1 = speckleData.getExtrusion(pair[aKey][partId], logVerbose);
                                const extrusion2 = speckleData.getExtrusion(pair[bKey][partId], logVerbose);//assumes matching objects
                                if (extrusion1 && extrusion2) {
                                    let tweenPathObject = this.getTweenPathObject(extrusion1.polyline, extrusion2.polyline, colors[name], 0, extrusion1.z, extrusion2.z, extrusion1.height, extrusion2.height);
                                    tweenPathObject.id = name;
                                    tweenPathObject.group = name + '_' + partId;
                                    if (logVerbose) {
                                        console.log(aKey + '->' + bKey + ' -- zPos: ' + tweenPathObject.fromZ + ' -> ' + tweenPathObject.toZ);
                                    }
                                    tweenPathObject.fromKey = options[optionKeys[i]];
                                    tweenPathObject.toKey = options[optionKeys[j]];
                                    ans.push(tweenPathObject);
                                } else {
                                    console.log('Missing Extrusion! ' + extrusion1 + ' - ' + extrusion2);
                                }
                            });

                        }

                    }
                }
            });

            const groupLists = {};
            ans.forEach((tweenObj, i) => {
                if (!tweenObj.group) return;
                if (!groupLists[tweenObj.group]) groupLists[tweenObj.group] = [];
                groupLists[tweenObj.group].push(tweenObj.fromKey + ' -> ' + tweenObj.toKey);
            });

            const targetGroupLength = 6;
            Object.keys(groupLists).forEach((k) => {
                const groupList = groupLists[k];
                if (groupList.length !== targetGroupLength) {
                    console.log('Length mismatch: ' + JSON.stringify(groupList, null, 2));
                }
            });

            let offset = 0;//used to minimize z-fighting
            ans.sort((a, b) => a.depth - b.depth);
            ans.forEach((tweenObj, i) => {
                tweenObj.offset = i * 0.001;
            });
            callback(ans);
        });
    }
}
