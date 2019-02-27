import {autorun} from "mobx";
import PolyOffset from "./geometry/PolyOffset";
import ReadingsStore from "./store/ReadingsStore";
import ViewsDataHandler from "./ViewsDataHandler";
import * as chroma from 'chroma-js';
import {Vector3} from "three-full";

/**
 * Creates a new instance of SceneData.
 * @class
 * @returns An instance of SceneData.
 * @example
 * var instance = new SceneData();
 */
export default class SceneData {
    threeApp;

    constructor(store, dataHandler) {
        this.store = store;
        this.dataHandler = dataHandler;
        this.polyOffsets = [];
        this.zOffset = 6;
        this.viewBlockers = [];
        this.studyPointClouds = [];
        this.studyPointSets = [];
        this.studyPointPaths = [];
        this.optionsObjects = [];
        this.controlledObjects = [];
        this.lastPickedPoint = null;

        this.dataHandler.on('ThreeAppReady', (threeApp) => {
            this.threeApp = threeApp;
            this.controlledObjects.push(this.threeApp.animatedPointCloud.particles);
            this.setupWatchers();
        });
    };

    setupWatchers() {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

        this.threeApp.on('point-hit', (point) => {
            this.lastPickedPoint = point;
            const index = this.dataHandler.findNearestPoint(point);
            if (index >= 0) {
                uiStore.setCurrentStudyPoint(index);
            }
        });

        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.threeApp.reprojector.updateChannels(targetStore.channels);
        });

        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.threeApp.viewDataReader.setObstructionVisibility(uiStore.blockersVisible);
        });

        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.setOptionVisibility(optionsStore.selectedOptions);
        });

        autorun(() => {
            // console.log('AUTORUN ' + JSON.stringify(uiStore.mode));
            this.setMode(uiStore.mode, uiStore.selectedReviewTarget);
        });

        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.setReadings(uiStore.mode, readingsStore.readingSets, uiStore.selectedReviewTarget, optionsStore.selectedOptions, uiStore.valueRampMultiplier);
        });

        autorun(() => {
            this.updateStudyPoint(uiStore.studyPoints.current, uiStore.selectedReviewTarget, uiStore.valueRampMultiplier);
        });

    }


    updateStudyPoint(index, selectedReviewTarget, valueRampMultiplier) {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;
        const viewTarget = targetStore.viewTargets[selectedReviewTarget];
        const ramp = this.getRamp(selectedReviewTarget, valueRampMultiplier);
        this.threeApp.setStudyCubeColor(ramp(viewTarget.currentPoint.unobstructed));
        console.log(this.threeApp.getStudyPos());
    }

    setViewTargets(objectsToAdd, targetId) {
        const threeObjects = this.threeApp.addObjects(objectsToAdd);
        threeObjects.forEach((obj, i) => {
            this.controlledObjects.push(obj);
        });
        this.store.targetStore.setTargetObjects(targetId, threeObjects);
    }

    getRamp(selectedReviewTarget, valueRampMultiplier) {
        const {targetStore} = this.store;
        const rampColor = targetStore.viewTargets[selectedReviewTarget].color;

        const positiveScale = chroma.scale([
            '#333333',
            chroma(rampColor).darken(1.5).hex(),
            rampColor,
            chroma(rampColor).brighten(1.5).hex(),
        ]).mode('lch');

        return (v) => {
            return positiveScale((v / 2000) * valueRampMultiplier).hex();
        };
    }

    setReadings(mode, readingSets, selectedReviewTarget, selectedOptions, valueRampMultiplier) {
        if (mode !== 'review') return;//optimization since we can't see the point cloud
        const pointProperties = [];
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

        if (selectedOptions.length !== 1) return;

        const selectedOption = selectedOptions[0];

        const ramp = this.getRamp(selectedReviewTarget, valueRampMultiplier);

        Object.keys(readingSets).forEach((k) => {
            if (k !== selectedOption) return;
            const readingSet = readingSets[k];
            let val = 0;
            Object.keys(readingSet.readings).forEach((readingId) => {
                const reading = readingSet.readings[readingId];
                Object.keys(reading.values).forEach((c) => {
                    const channelId = targetStore.getIdForChannel(c);
                    if (channelId === selectedReviewTarget) {
                        val = reading.values[c].o / ReadingsStore.sunAreaOfFullSphere;
                    }
                });
                pointProperties.push({
                    'x': reading.position.x,
                    'y': reading.position.y,
                    'z': reading.position.z,
                    'a': 1,
                    'color': ramp(val),
                    'size': 5,
                });
            });

        });
        while (pointProperties.length < ViewsDataHandler.ANIMATED_POINTS_COUNT) {
            pointProperties.push({
                'x': 0,
                'y': 0,
                'z': 0,
                'a': 0,
                'color': '#00000',
                'size': 1,
            });
        }

        this.threeApp.updatePoints(pointProperties);
    }

    setMode(mode, selectedReviewTarget) {
        if (mode === 'review') {
            this.threeApp.renderer.setClearColor('#444444');
            this.threeApp.animatedPointCloud.particles.userData.hiddenByMode = false;
            this.studyPointClouds.forEach((pointCloud, i) => {
                pointCloud.userData.hiddenByMode = true;
            });
            Object.keys(this.store.targetStore.viewTargets).forEach((k) => {
                let viewTarget = this.store.targetStore.viewTargets[k];
                if (viewTarget.threeObjects) {
                    viewTarget.threeObjects.forEach((obj, i) => {
                        obj.userData.hiddenByMode = k !== selectedReviewTarget;
                    });
                }
            });
        } else {
            this.threeApp.renderer.setClearColor('#eeeeee');
            this.threeApp.animatedPointCloud.particles.userData.hiddenByMode = true;
            this.studyPointClouds.forEach((pointCloud, i) => {
                pointCloud.userData.hiddenByMode = false;
            });
            Object.keys(this.store.targetStore.viewTargets).forEach((k) => {
                let viewTarget = this.store.targetStore.viewTargets[k];
                if (viewTarget.threeObjects) {
                    viewTarget.threeObjects.forEach((obj, i) => {
                        obj.userData.hiddenByMode = false;
                    });
                }
            });
        }
        this.setVisibility();
    }

    updateObjects(objectsToAdd, type) {
        const activeOptions = this.store.optionsStore.selectedOptions;
        const addedObjects = this.threeApp.addObjects(objectsToAdd);

        addedObjects.forEach((o, i) => {
            o.userData.options = activeOptions;

            this.addOptionObject(o);
        });

        if (type === 'paths') {
            this.threeApp.addExtras(addedObjects);
            addedObjects.forEach((pathObject, i) => {
                this.studyPointPaths.push(pathObject);
            });
        }

        this.addPolyOffsets();
    }

    addOutline(outline) {
        const polyOffset = new PolyOffset(outline);
        polyOffset.options = this.store.optionsStore.selectedOptions;
        this.polyOffsets.push(polyOffset);
    }

    addPolyOffsets() {
        const {offset, spacing} = this.store.uiStore.pointOptions;

        this.studyPointSets.length = 0;
        console.log('# polyOffsets: ' + this.polyOffsets.length);
        this.polyOffsets.forEach((polyOffset, i) => {
            if (!polyOffset.pointsAdded) {
                const offsetPoints = polyOffset.calculateOffsetPoints(offset, spacing);
                if (!offsetPoints) return;
                offsetPoints.pop();//last point is a duplicate of the first
                const {pointCloud, points} = this.threeApp.addPoints(offsetPoints.map((pt) => {
                    return [pt[0], pt[1], polyOffset.zPos + this.zOffset];
                }));
                this.studyPointSets.push({points: points, options: polyOffset.options});
                pointCloud.userData.options = polyOffset.options;
                this.addOptionObject(pointCloud);
                this.studyPointClouds.push(pointCloud);
                polyOffset.pointsAdded = true;
            }
        });

        this.updateActiveStudyPoints(this.store.optionsStore.selectedOptions);
    }

    updatePoints() {
        this.clearPoints();
        this.polyOffsets.forEach((polyOffset, i) => {
            polyOffset.pointsAdded = false;
        });
        this.addPolyOffsets();
    }

    clearStudyPoints() {
        this.clearPoints();

        this.polyOffsets.length = 0;

        this.threeApp.removeObjects(this.studyPointPaths);
        this.studyPointPaths.length = 0;
        // this.store.uiStore.setStudyPointCount(this.activeStudyPoints.length);
    }

    clearPoints() {
        this.threeApp.removeObjects(this.studyPointClouds);
        // this.activeStudyPoints.length = 0;
        this.threeApp.pointClouds.length = 0;
        this.studyPointClouds.length = 0;
        this.updateActiveStudyPoints([]);
    }

    clearViewBlockers() {
        this.threeApp.removeObjects(this.viewBlockers);
        this.viewBlockers.length = 0;
    }

    setCameraView(camera) {
        // const example = {
        //     "eye": [-2317.502253000506, 67889.3669697359, 12554.280586923],
        //     "target": [25676.671238304432, 31970.13494484759, -3213.8691468145475],
        //     "up": [0.20113160968421956, -0.25807130751799795, 0.9449578169536383],
        //     "fov": 35,
        //     "type": "Camera",
        // };
        // console.log(JSON.stringify(camera));
        this.threeApp.setCameraPos(camera.eye, camera.target, camera.up, camera.fov);
    }


    centerView() {
        const studyPos = this.threeApp.getStudyPos();
        this.threeApp.setCameraPos([studyPos.x, studyPos.y + 300, studyPos.z + 200], [studyPos.x, studyPos.y, studyPos.z], [0, 0, 1], 90);
    }

    setViewBlockers(objectsToAdd) {
        const activeOptions = this.store.optionsStore.selectedOptions;
        const objectsAdded = this.threeApp.addObjects(objectsToAdd);
        objectsAdded.forEach((mesh, i) => {
            mesh.userData.options = activeOptions;
            this.addOptionObject(mesh);
            this.viewBlockers.push(mesh);
            this.threeApp.viewDataReader.addObstructionMesh(mesh);
        });

    }

    setVisibility() {
        this.controlledObjects.forEach((o, i) => {
            if (o.userData) {
                let include = !o.userData.hiddenByMode;
                include = include && !o.userData.hiddenByOption;
                o.userData.excluded = !include;
                o.visible = !o.userData.excluded;//some objects visibility will be overriden in ThreeApp
            }
        });
    }

    updateActiveStudyPoints(selectedOptions) {
        const activeStudyPoints = [];
        this.studyPointSets.forEach((studyPoints, i) => {
            if (SceneData.optionsMatch(studyPoints.options, selectedOptions)) {
                [].push.apply(activeStudyPoints, studyPoints.points)
            }
        });
        this.dataHandler.setActiveStudyPoints(activeStudyPoints);

        if (this.lastPickedPoint) {
            const index = this.dataHandler.findNearestPoint(this.lastPickedPoint);
            if (index >= 0) {
                this.store.uiStore.setCurrentStudyPoint(index);
            }
        }
    }

    setOptionVisibility(selectedOptions) {
        this.updateActiveStudyPoints(selectedOptions);

        this.optionsObjects.forEach((o, i) => {
            o.userData.hiddenByOption = !SceneData.optionsMatch(o.userData.options, selectedOptions);
        });
        this.setVisibility();
    }

    addOptionObject(obj) {
        this.optionsObjects.push(obj);
        this.controlledObjects.push(obj);
    }

    static optionsMatch(options, selectedOptions) {
        if (!options) return false;
        let match = false;
        selectedOptions.forEach((option, i) => {
            if (options.indexOf(option) >= 0) {
                match = true;
            }
        });
        return match;
    }

}
