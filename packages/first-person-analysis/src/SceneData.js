import {autorun} from "mobx";
import PolyOffset from "./geometry/PolyOffset";
import ReadingsStore from "./store/ReadingsStore";
import ViewsDataHandler from "./ViewsDataHandler";
import * as chroma from 'chroma-js';
import {Vector3} from "three-full";
import MeshPoints from "./geometry/MeshPoints";
import {FilePersist} from "colorizer-three";
import PlanarSelection from "./geometry/PlanarSelection";

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
        this.pointGenerators = [];
        this.viewBlockers = [];
        this.studyPointClouds = [];
        this.studyPointSets = [];
        this.studyPointPaths = [];
        this.optionsObjects = [];
        this.controlledObjects = [];
        this.metaData = {};

        // this.lastPickedPoint = null;

        this.dataHandler.on('ThreeAppReady', (threeApp) => {
            this.threeApp = threeApp;
            this.controlledObjects.push(this.threeApp.animatedPointCloud.particles);
            this.setupWatchers();
            this.store.getInterop().pageLoad();
        });

        this.dataHandler.on('SaveScene', () => {
            this.saveFile();
        });

        this.dataHandler.on('LoadScene', (data) => {
            this.loadFile(data);
        });
    };


    setMetaData(variable, data) {
        this.metaData[variable] = data;
        if (variable === 'window-size') {
            this.metaData['window-size-offset'] = {
                width: data.width - window.innerWidth,
                height: data.height - window.innerHeight,
            };
            console.log('window-size-offset', this.metaData['window-size-offset']);
        }
    }

    selectPoints(point, multipleMode) {
        const {uiStore} = this.store;
        const {dataHandler} = this;

        const index = dataHandler.findNearestPoint(point);

        if (multipleMode) {
            if (uiStore.lastPickedPoint) {
                const index1 = dataHandler.findNearestPoint(uiStore.lastPickedPoint);
                const index2 = dataHandler.findNearestPoint(point);

                if (index1 >= 0 && index2 >= 0) {
                    let corner1 = dataHandler.activeStudyPoints[index1];
                    let corner2 = dataHandler.activeStudyPoints[index2];
                    const planarSelection = new PlanarSelection(corner1, corner2);
                    const boundsTolerance = Math.min(uiStore.pointOptions.height, uiStore.pointOptions.spacing / 2) - 0.5;
                    planarSelection.findPlanarPointsBetween(dataHandler.activeStudyPoints, 1, boundsTolerance);
                    uiStore.setSelectionPoints('3d', planarSelection.matchingPoints);
                    uiStore.setSelectionPoints('indices', planarSelection.matchingPoints.map((pt) => {
                        return dataHandler.activeStudyPoints.indexOf(pt);
                    }));

                    // this.threeApp.debugPlane(planarSelection.plane, '#ff0000');
                    // this.threeApp.debugPoints([corner1, corner2, planarSelection.corner3], '#ff0000');

                    this.threeApp.compositeViewPositions = {points: planarSelection.matchingPoints, index: 0};
                }
            }
            // this.threeApp.viewDataReader.enabled = false;//don't read points in this mode (or support multiple points to enable this...)
        } else {
            this.threeApp.compositeViewPositions = {points: [], index: 0};
            this.threeApp.viewDataReader.enabled = true;
        }

        this.dataHandler.setCurrentStudyPoint(index, true);
    }

    setupWatchers() {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

        this.threeApp.on('point-hit', (point, e) => {
            this.selectPoints(point, e.shiftKey);
        });
        this.threeApp.on('scene-update', () => {
            uiStore.setSelectionPoints('2d', this.threeApp.toScreenPositions(uiStore.selectionPoints['3d']));
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
            //watch 'options' array for deletion events and remove any references to that option
            this.cleanUpOptions(optionsStore.options);
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
            this.setReadings(uiStore.mode, readingsStore.readingSets, uiStore.selectedReviewTarget, optionsStore.selectedOptions, uiStore.valueRampMultiplier, uiStore.pointCloudOptions.pointSize);
        });

        autorun(() => {
            this.updateStudyPoint(uiStore.studyPoints.current, readingsStore.readingSets, uiStore.selectedReviewTarget, optionsStore.selectedOptions, uiStore.valueRampMultiplier);
        });

        autorun(() => {
            this.updateMaterials(uiStore.selectionPoints['3d'], uiStore.reviewDarkBlockers);
        });


        autorun(() => {
            this.threeApp.viewOnlyMode = uiStore.analysisOptions.viewsOnly;
        });

        autorun(() => {
            this.threeApp.setViewAngle(uiStore.viewAngleDeg);
        });

        autorun(() => {
            this.threeApp.setPreviewVisible(uiStore.viewOptions.showPreview);
        });
    }

    updateMaterials(selectionPoints3D, reviewDarkBlockers) {
        const flat = selectionPoints3D.length > 1 || reviewDarkBlockers;
        const flatMat = this.threeApp.getColoredMaterial('#21212c', 1, {basicMaterial: true});
        this.viewBlockers.forEach((obj, i) => {
            obj.material = (flat) ? flatMat : this.threeApp.getColoredMaterial(obj.userData.meta.color);
        });
    }

    updateStudyPoint(index, readingSets, selectedReviewTarget, selectedOptions, valueRampMultiplier) {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;
        let reading = readingsStore.getReading(index);
        targetStore.setCurrentValues(reading);

        const ramp = this.getRamp(selectedReviewTarget, valueRampMultiplier);
        const viewTarget = targetStore.viewTargets[selectedReviewTarget];

        let studyColor;
        if (uiStore.pointCloudOptions.colorByDifference) {
            if (selectedOptions.length !== 1) return;

            const selectedOption = selectedOptions[0];
            const comparisonsByPosition = this.getComparisonPoints(readingSets, selectedOption, targetStore, selectedReviewTarget);

            const comparisonVal = comparisonsByPosition[SceneData.positionToKey(reading.position)] / ReadingsStore.sunAreaOfFullSphere;
            studyColor = ramp(viewTarget.currentPoint.unobstructed / comparisonVal);
        } else {
            studyColor = ramp(viewTarget.currentPoint.unobstructed);
        }

        if (studyColor) {
            this.threeApp.setStudyCubeColor(studyColor);
        }
        // console.log(this.threeApp.getStudyPos());
    }

    setViewTargets(objectsToAdd, targetId) {
        const {targetStore, optionsStore} = this.store;
        const activeOptions = optionsStore.selectedOptions;

        targetStore.deleteTargetObjects(targetId, activeOptions, (objects) => {
            this.threeApp.removeObjects(objects);
        });
        const threeObjects = this.threeApp.addObjects(objectsToAdd);
        threeObjects.forEach((obj, i) => {
            obj.userData.options = activeOptions;
            this.addOptionObject(obj);
        });
        targetStore.setTargetObjects(targetId, threeObjects);
    }

    getRamp(selectedReviewTarget, valueRampMultiplier) {
        const {targetStore, uiStore} = this.store;
        const rampColor = targetStore.viewTargets[selectedReviewTarget].color;

        if (uiStore.pointCloudOptions.colorByDifference) {
            return this.getDivergingRamp(valueRampMultiplier);
        } else {
            return this.getColoredRamp(rampColor, valueRampMultiplier);
        }
    }

    getColoredRamp(rampColor, valueRampMultiplier) {
        const colorScale = chroma.scale([
            '#333333',
            chroma(rampColor).darken(1.5).hex(),
            rampColor,
            chroma(rampColor).brighten(1.5).hex(),
        ]).mode('lch');

        return (v) => {
            return colorScale((v / 2000) * valueRampMultiplier).hex();
        };
    }

    getDivergingRamp(valueRampMultiplier) {
        const equalValue = '#494980';
        const negativeScale = chroma.scale([
            equalValue,
            '#a365ff',
            '#ff76b1',
        ]).mode('lch');

        const positiveScale = chroma.scale([
            equalValue,
            '#689525',
            '#e4ff76',
        ]).mode('lch');


        return (v) => {
            if (v === 0) {
                return '#333333';
            }
            if (v === 1) {
                return equalValue;
            }

            if (v > 1) {
                return positiveScale((v - 1) * valueRampMultiplier).hex()
            } else {
                return negativeScale((1 / v - 1) * valueRampMultiplier).hex()
            }
        };

    }

    static positionToKey(p) {
        return p.x + '_' + p.y + '_' + p.z;
    }


    setReadings(mode, readingSets, selectedReviewTarget, selectedOptions, valueRampMultiplier, pointSize) {
        if (mode !== 'review') return;//optimization since we can't see the point cloud
        const pointProperties = [];
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;

        if (selectedOptions.length !== 1) return;

        const selectedOption = selectedOptions[0];

        const ramp = this.getRamp(selectedReviewTarget, valueRampMultiplier);

        let comparisonsByPosition = {};

        if (uiStore.pointCloudOptions.colorByDifference) {
            comparisonsByPosition = this.getComparisonPoints(readingSets, selectedOption, targetStore, selectedReviewTarget);
        }

        Object.keys(readingSets).forEach((k) => {
            if (k !== selectedOption) return;
            const readingSet = readingSets[k];
            let val = 0;
            Object.keys(readingSet.readings).forEach((readingId) => {
                const reading = readingSet.readings[readingId];
                if (!reading.position) return;
                let divisor = ReadingsStore.sunAreaOfFullSphere;
                if (uiStore.pointCloudOptions.colorByDifference) {
                    divisor = comparisonsByPosition[SceneData.positionToKey(reading.position)];
                }
                if (divisor) {
                    Object.keys(reading.values).forEach((c) => {
                        const channelId = targetStore.getIdForChannel(c);
                        if (channelId === selectedReviewTarget) {
                            val = reading.values[c].o / divisor;
                        }
                    });
                } else {
                    val = 0;
                }
                pointProperties.push({
                    'x': reading.position.x,
                    'y': reading.position.y,
                    'z': reading.position.z,
                    'a': 1,
                    'color': ramp(val),
                    'size': pointSize,
                });
            });
        });


        while (pointProperties.length < ViewsDataHandler.ANIMATED_POINTS_COUNT) {
            pointProperties.push({
                'x': 0,
                'y': 0,
                'z': 0,
                'a': 0,
                'color': '#000000',
                'size': 1,
            });
        }

        this.threeApp.updatePoints(pointProperties);
    }

    getComparisonPoints(readingSets, selectedOption, targetStore, selectedReviewTarget) {
        const comparisonsByPosition = {};
        Object.keys(readingSets).forEach((k) => {
            if (k === selectedOption) return;//TODO provide better logic for which non-selected option is used for comparison...
            const readingSet = readingSets[k];
            Object.keys(readingSet.readings).forEach((readingId) => {
                const reading = readingSet.readings[readingId];
                if (!reading.position) return;
                Object.keys(reading.values).forEach((c) => {
                    const channelId = targetStore.getIdForChannel(c);
                    if (channelId === selectedReviewTarget) {
                        comparisonsByPosition[SceneData.positionToKey(reading.position)] = reading.values[c].o;
                    }
                });
            });
        });
        return comparisonsByPosition;
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

        this.updatePoints();
    }

    addOutline(outline) {
        const polyOffset = new PolyOffset(outline);
        polyOffset.options = this.store.optionsStore.selectedOptions;
        this.pointGenerators.push(polyOffset);
    }

    addPointsMesh(mesh) {
        const meshPoints = new MeshPoints(mesh);
        meshPoints.options = this.store.optionsStore.selectedOptions;
        this.pointGenerators.push(meshPoints);
    }

    addGeneratedPoints() {

        this.studyPointSets.length = 0;
        console.log('# polyOffsets: ' + this.pointGenerators.length);
        this.pointGenerators.forEach((pointGenerator, i) => {
            let generatedPoints;
            let height = 0;
            if (pointGenerator.type === 'PolyOffset') {
                const {offset, spacing} = this.store.uiStore.pointOptions;
                height = this.store.uiStore.pointOptions.height;
                const points2D = pointGenerator.calculateOffsetPoints(offset, spacing);

                if (points2D) {
                    points2D.pop();//last point is a duplicate of the first
                    generatedPoints = points2D.map((pt) => {
                        return new Vector3(pt[0], pt[1], pointGenerator.zPos + height);
                    });
                }
            }
            if (pointGenerator.type === 'MeshPoints') {
                height = this.store.uiStore.surfaceOptions.height;
                const {density} = this.store.uiStore.surfaceOptions;
                generatedPoints = pointGenerator.calculateRandomOnSurface(density, new Vector3(0, 0, height));
            }

            if (!generatedPoints) return;
            const {pointCloud, points} = this.threeApp.addPoints(generatedPoints);
            pointCloud.name = i + '_' + pointGenerator.type + '_' + points.length;
            this.studyPointSets.push({points: points, options: pointGenerator.options, type: pointGenerator.type});
            pointCloud.userData.studyPoints = points;
            pointCloud.userData.options = pointGenerator.options;
            this.addOptionObject(pointCloud);
            this.studyPointClouds.push(pointCloud);

        });

        console.log('GENERATED POINTS');
        let cnt = 0;
        this.studyPointSets.forEach((pointSet, i) => {
            console.log(pointSet.type + ': ' + pointSet.points.length);
            cnt += pointSet.points.length;
        });
        console.log(cnt + ' POINTS GENERATED');

        this.updateActiveStudyPoints(this.store.optionsStore.selectedOptions);
    }

    updatePoints() {
        this.clearPoints();
        this.addGeneratedPoints();
    }

    clearStudyPoints() {
        this.clearPoints();

        this.pointGenerators.length = 0;

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

    setCameraView(camera, speckleData) {
        // const example = {
        //     "eye": [-2317.502253000506, 67889.3669697359, 12554.280586923],
        //     "target": [25676.671238304432, 31970.13494484759, -3213.8691468145475],
        //     "up": [0.20113160968421956, -0.25807130751799795, 0.9449578169536383],
        //     "fov": 35,
        //     "type": "Camera",
        // };
        // console.log(JSON.stringify(camera));
        for (let i = 0; i < camera.eye.length; i++) {
            camera.eye[i] *= speckleData.settings.scale;
        }
        for (let i = 0; i < camera.target.length; i++) {
            camera.target[i] *= speckleData.settings.scale;
        }
        // camera.eye[1] *= -1;
        // camera.target[1] *= -1;
        this.threeApp.setCameraPos(camera.eye, camera.target, camera.up, camera.fov, {testCube: false});
        if (this.store.uiStore.viewOptions.matchAspect) {
            const mousePane = this.threeApp.mousePane;
            let widthDiff = mousePane.height * camera.aspectRatio - mousePane.width;
            this.setWindowSize(window.innerWidth + widthDiff, window.innerHeight);//
        }
    }

    setWindowSize(width, height) {
        let offsets = this.metaData['window-size-offset'] || {width: 0, height: 0};

        this.store.getInterop().setWindowSize({width: width + offsets.width, height: height + offsets.height});//
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
            mesh.userData.isViewBlocker = true;
            this.addOptionObject(mesh);
            this.viewBlockers.push(mesh);
            this.threeApp.viewDataReader.addObstructionMesh(mesh);
        });

    }

    withAllOptionsObjects(handler) {
        this.optionsObjects.forEach((obj, i) => {
            handler(obj.userData);
        });
        this.pointGenerators.forEach((pointGenerator, i) => {
            handler(pointGenerator);
        });
        this.studyPointSets.forEach((pointSet, i) => {
            handler(pointSet);
        });
    }

    duplicateActiveOption() {
        const {optionsStore} = this.store;
        const activeOptions = optionsStore.selectedOptions;
        if (activeOptions.length !== 1) return;
        const activeOptionKey = optionsStore.selectedOptions[0];
        const newOption = optionsStore.addOption();
        //assign the duplicate option's key for any objects that are currently associated with the duplicated options
        this.withAllOptionsObjects((opOb) => {
            if (opOb.options.indexOf(activeOptionKey) >= 0) {
                opOb.options.push(newOption.key);
            }
        });
        optionsStore.selectOption(newOption.key);
    }

    deleteActiveOption() {
        const {optionsStore} = this.store;
        const activeOptions = optionsStore.selectedOptions;
        if (activeOptions.length !== 1) return;
        const activeOptionKey = optionsStore.selectedOptions[0];
        const activeOption = optionsStore.getOption(activeOptionKey);
        if (window.confirm(`Are you sure you want to delete ${activeOption.name}?`)) {
            optionsStore.deleteOption(activeOptionKey);//change to options list will trigger autorun watcher
        }
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
        this.rerenderCompositeViews();
    }

    rerenderCompositeViews() {
        if (!this.threeApp || !this.threeApp.compositeViewPositions) return;
        this.threeApp.compositeViewPositions.index = 0;

    }

    updateActiveStudyPoints(selectedOptions) {
        const {uiStore} = this.store;
        const activeStudyPoints = [];
        this.studyPointSets.forEach((studyPoints, i) => {
            if (SceneData.optionsMatch(studyPoints.options, selectedOptions)) {
                [].push.apply(activeStudyPoints, studyPoints.points)
            }
        });
        this.dataHandler.setActiveStudyPoints(activeStudyPoints);

        if (uiStore.lastPickedPoint) {
            const index = this.dataHandler.findNearestPoint(uiStore.lastPickedPoint);
            if (index >= 0) {
                uiStore.setCurrentStudyPoint(index);
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

    static removeOptions(obj, selectedOptions) {
        if (!selectedOptions || !obj.userData.options) return false;
        obj.userData.options = obj.userData.options.filter((o) => {
            return selectedOptions.indexOf(o) < 0;
        });
    }

    cleanUpOptions(options) {
        const allValidOptionIds = options.map((o) => o.key);
        this.withAllOptionsObjects((opOb) => {
            opOb.options = opOb.options.filter((o) => {
                return allValidOptionIds.indexOf(o) >= 0;
            });
        });
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

    saveFile() {
        const {targetStore, uiStore, optionsStore, readingsStore} = this.store;
        const scene = this.threeApp.scene;
        const metaData = {
            optionsStore: optionsStore.getMeta(),
            targetStore: targetStore.getMeta(),
            uiStore: uiStore.getMeta(),
            readingsStore: readingsStore.getMeta(),
            threeApp: this.threeApp.getMeta(),
        };
        scene.userData.metaData = metaData;

        const interop = this.store.getInterop();
        FilePersist.saveScene(scene, (data) => {
            interop.saveTextToFile({title: 'Save scene', data: data, ext: 'gltf'});
        });
    }

    loadFile(data) {
        //Note that this does not support textures etc that may be referenced within the gltf file

        FilePersist.loadSceneData(data, (scene) => {
            const {targetStore, uiStore, optionsStore, readingsStore} = this.store;
            let metaData = scene.userData.metaData;
            const objectsBySasType = {};
            let cnt = 0;

            const objectsToAdd = [];
            scene.children.forEach((child, i) => {
                if (child.userData.dontPersist) {
                    return;
                }
                if (child.type === 'Points') {
                    if (!child.userData.studyPoints) {
                        return;
                    }
                }

                objectsToAdd.push(child);

                if (child.userData.options) {
                    this.addOptionObject(child);
                }

                if (child.userData.isViewBlocker) {
                    this.viewBlockers.push(child);
                    this.threeApp.viewDataReader.addObstructionMesh(child);
                }

                if (child.userData.isViewTarget) {
                    this.controlledObjects.push(child);
                }

                if (child.userData.studyPoints) {
                    console.log(child.uuid + '  ' + child.name + ' LOADED POINTS ' + child.userData.options.join('|') + ' : ' + child.userData.studyPoints.length);
                    cnt += child.userData.studyPoints.length;
                    this.studyPointSets.push({
                        points: child.userData.studyPoints.map((p) => new Vector3(p.x, p.y, p.z)),
                        options: child.userData.options
                    });
                    this.addOptionObject(child);
                    this.studyPointClouds.push(child);
                    this.threeApp.pointClouds.push(child);
                }


                if (child.userData.sasType) {
                    Object.keys(child.userData.sasType).forEach((type) => {
                        if (child.userData.sasType[type]) {
                            if (!objectsBySasType[type]) objectsBySasType[type] = [];
                            objectsBySasType[type].push(child);
                        }
                    });
                }

            });

            objectsToAdd.forEach((obj, i) => {
                this.threeApp.scene.add(obj);
            });
            if (metaData) {
                optionsStore.setMeta(metaData.optionsStore);
                targetStore.setMeta(metaData.targetStore, objectsBySasType);
                uiStore.setMeta(metaData.uiStore);
                readingsStore.setMeta(metaData.readingsStore);
                this.threeApp.setMeta(metaData.threeApp)
            }

        })
    }
}
