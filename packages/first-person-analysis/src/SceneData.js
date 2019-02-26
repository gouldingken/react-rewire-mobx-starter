import {autorun} from "mobx";
import PolyOffset from "./geometry/PolyOffset";
import ReadingsStore from "./store/ReadingsStore";
import * as chroma from 'chroma-js';

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
        this.studyPointPaths = [];
        this.optionsObjects = [];
        this.controlledObjects = [];

        this.dataHandler.on('ThreeAppReady', (threeApp) => {
            this.threeApp = threeApp;
            this.controlledObjects.push(this.threeApp.animatedPointCloud.particles);
            this.setupWatchers();
        });
    };

    setupWatchers() {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

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
            this.setReadings(readingsStore.readingSets, uiStore.selectedReviewTarget, optionsStore.selectedOptions, uiStore.valueRampMultiplier);
        });
    }

    setViewTargets(objectsToAdd, targetId) {
        const threeObjects = this.threeApp.addObjects(objectsToAdd);
        threeObjects.forEach((obj, i) => {
            this.controlledObjects.push(obj);
        });
        this.store.targetStore.setTargetObjects(targetId, threeObjects);
    }

    setReadings(readingSets, selectedReviewTarget, selectedOptions, valueRampMultiplier) {
        const pointProperties = [];
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

        if (selectedOptions.length !== 1) return;

        const selectedOption = selectedOptions[0];

        const positiveScale = chroma.scale([
            '#f1fffd',
            '#a4e2ff',
            '#006eff',
            '#272d4e',
        ]).mode('lch');

        const ramp = (v) => {
            return positiveScale((v / 2000) * valueRampMultiplier).hex();

        };

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

        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    addOutline(outline) {
        const polyOffset = new PolyOffset(outline);
        polyOffset.options = this.store.optionsStore.selectedOptions;
        this.polyOffsets.push(polyOffset);
    }

    addPolyOffsets() {
        const {offset, spacing} = this.store.uiStore.pointOptions;

        this.polyOffsets.forEach((polyOffset, i) => {
            if (!polyOffset.pointsAdded) {
                const offsetPoints = polyOffset.calculateOffsetPoints(offset, spacing);
                const pointCloud = this.threeApp.addPoints(offsetPoints.map((pt) => {
                    return [pt[0], pt[1], polyOffset.zPos + this.zOffset];
                }));
                pointCloud.userData.options = polyOffset.options;
                this.addOptionObject(pointCloud);
                this.studyPointClouds.push(pointCloud);
                polyOffset.pointsAdded = true;
            }
        });
    }

    updatePoints() {
        this.clearPoints();
        this.polyOffsets.forEach((polyOffset, i) => {
            polyOffset.pointsAdded = false;
        });
        this.addPolyOffsets();
        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
        this.store.readingsStore.reset();
    }

    clearStudyPoints() {
        this.clearPoints();

        this.polyOffsets.length = 0;

        this.threeApp.removeObjects(this.studyPointPaths);
        this.studyPointPaths.length = 0;
        this.store.uiStore.setStudyPointCount(this.threeApp.studyPoints.length);
    }

    clearPoints() {
        this.threeApp.removeObjects(this.studyPointClouds);
        this.threeApp.studyPoints.length = 0;
        this.studyPointClouds.length = 0;
    }

    clearViewBlockers() {
        this.threeApp.removeObjects(this.viewBlockers);
        this.viewBlockers.length = 0;
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

    setOptionVisibility(selectedOptions) {
        this.optionsObjects.forEach((o, i) => {
            if (o.userData.options) {
                let include = false;
                selectedOptions.forEach((option, i) => {
                    if (o.userData.options.indexOf(option) >= 0) {
                        include = true;
                    }
                });
                o.userData.hiddenByOption = !include;
            }
        });
        this.setVisibility();
    }

    addOptionObject(obj) {
        this.optionsObjects.push(obj);
        this.controlledObjects.push(obj);
    }
}
