/**
 * Creates a new instance of ThreeAppFirstPerson.
 * @class
 * @returns An instance of ThreeAppFirstPerson.
 * @example
 * var instance = new ThreeAppFirstPerson();
 */
import {ThreeApp} from "colorizer-three";
import ViewDataReader from "./projections/ViewDataReader";
import CubemapReprojector from "./projections/CubemapReprojector";
import {BoxGeometry, GLTFExporter, Matrix4, Mesh, Vector3} from "three-full";
import AnimatedParticles from "./AnimatedParticles";
import ViewsDataHandler from "../ViewsDataHandler";
import AverageFrames from "./effects/AverageFrames";

export default class ThreeAppFirstPerson extends ThreeApp {

    constructor(holder, dataHandler, settings) {
        super(holder, dataHandler, settings);
        const channels = {
            channel1: '#ffdf1c',
            channel2: '#d16cff',
            channel3: '#50d0d3',
        };
        this.pointClouds = [];
        this.extras = [];

        const material = this.getColoredMaterial('#00ff00', 1);
        const camPosGeom = new BoxGeometry(10, 10, 10, 1, 1, 1);
        this.cubeCamPos = new Mesh(camPosGeom, material);
        this.cubeCamPos.userData.dontPersist = true;
        this.scene.add(this.cubeCamPos);

        this.reprojector = new CubemapReprojector(this.renderer, 512, channels, true, true);
        this.viewDataReader = new ViewDataReader(this.scene, this.reprojector);

        this.averageFrames = new AverageFrames(this.renderer, this.reprojector.width, this.reprojector.height);

        this.animatedPointCloud = new AnimatedParticles(ViewsDataHandler.ANIMATED_POINTS_COUNT);
        let animatePointCloudObject = this.animatedPointCloud.getObject();
        this.addToScene(animatePointCloudObject);

        this.dataHandler.initialize(this);

        this.compositeViewPositions = {
            index: 0,
            points: []
        };

        this.enableMouseInteraction(4);
    };

    updateInteractions() {
        this.interactableObjects.forEach((o, i) => {
            o.visible = true;
        });
        super.updateInteractions();
    }

    get interactableObjects() {
        //Note we don't need to include animatedPointCloud.particles because even when hidden, we can
        // use the regular static point clouds for hit testing
        return this.pointClouds;
    }

    setStudyCubeColor(color) {
        this.cubeCamPos.material = this.getColoredMaterial(color, 1);
    }

    onInteraction(intersects) {
        if (this.mouse.downEvent) {
            let hitPoint = false;
            intersects.forEach((hit, i) => {
                if (hitPoint) return;
                if (hit.point) {
                    hitPoint = hit.point;
                    // console.log(`POINT NUM ${hit.index} dist: ${hit.distance}`);

                    return false;
                }
            });
            if (hitPoint) {
                this.emit('point-hit', hitPoint, this.mouse.downEvent.event);
            }
        }
    }

    updatePoints(pointProperties) {
        this.animatedPointCloud.setProperties(pointProperties);
    }

    addToScene(objects) {
        objects.forEach((o, i) => {
            this.scene.add(o);
        });
    }

    updateScene() {
        this.studyPos = this.nextStudyPos();
        this.cubeCamPos.position.copy(this.getStudyPos());
        if (this.viewDataReader.enabled) {
            this.readData();
        }

        if (this.animatedPointCloud) {
            let animationSpeed = 0.1;
            this.animatedPointCloud.step(animationSpeed);
        }
        this.emit('scene-update');
    }

    nextStudyPos() {
        return this.dataHandler.nextStudyPos();
    }

    getStudyPos() {
        return this.studyPos;
        // return new Vector3(10, 5 + 5 * Math.sin(this.incrementor / 100), 10);
    }

    readData() {
        const sensor = {position: this.getStudyPos()};
        this.viewDataReader.readSensors([sensor]);
        this.dataHandler.setStudyPosData(sensor);
        // this.info.textContent = JSON.stringify(sensor.values);
    }

    showExtras(visible) {
        this.animatedPointCloud.particles.visible = visible && !this.animatedPointCloud.particles.userData.excluded;
        this.pointClouds.forEach((pointCloud, i) => {
            pointCloud.visible = visible && !pointCloud.userData.excluded;
        });
        this.extras.forEach((extra, i) => {
            extra.visible = visible && !extra.userData.excluded;
        });
        this.cubeCamPos.visible = visible;
    }

    addExtras(extras) {
        extras.forEach((extra, i) => {
            this.extras.push(extra);
        });
    }

    get mousePane() {
        const topPaneHeight = this.size.width / this.reprojector.aspectRatio;
        return {x: 0, y: topPaneHeight, width: this.size.width, height: this.size.height - topPaneHeight};
    }

    renderScene() {
        const topPaneHeight = this.size.width / this.reprojector.aspectRatio;
        const split = 1 - topPaneHeight / this.size.height;

        let cameraPos = this.getStudyPos();
        if (this.compositeViewPositions) {
            if (this.compositeViewPositions.points.length > this.compositeViewPositions.index) {
                cameraPos = this.compositeViewPositions.points[this.compositeViewPositions.index];
            }
        }

        // this.renderer.render(this.scene, this.camera);
        const camera = this.camera;
        const renderer = this.renderer;
        const scene = this.scene;
        const views = [
            {
                left: 0,
                bottom: 1 - split,
                width: 1,
                height: split,
                render: (width, height) => {
                    this.showExtras(true);
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                    renderer.render(scene, camera);
                    if (renderer.shadowMap.enabled) {
                        renderer.render(scene, camera);//double render required for shadow map
                    }
                }
            },
            {// lambert projection display
                left: 0,
                bottom: 0,
                width: 1,
                height: (1 - split),
                render: (width, height) => {
                    this.showExtras(false);

                    if (this.compositeViewPositions.points.length > 0) {
                        if (this.compositeViewPositions.index === 0) {
                            this.averageFrames.clear();
                        }
                        this.reprojector.renderLambert(cameraPos, scene, false);
                        this.averageFrames.render(this.reprojector.graphicsOutput, this.compositeViewPositions.points.length);
                        if (this.compositeViewPositions.points.length > this.compositeViewPositions.index) {
                            this.compositeViewPositions.index++;
                        }
                    } else {
                        this.averageFrames.clear();
                        this.reprojector.display(cameraPos, scene);
                    }
                }
            }
        ];

        views.forEach((view, i) => {
            const left = view.left * this.size.width;
            const width = view.width * this.size.width;
            const bottom = view.bottom * this.size.height;
            let height = view.height * this.size.height;

            if (!height) { //noinspection JSSuspiciousNameCombination
                height = width;
            }

            renderer.setViewport(left, bottom, width, height);
            renderer.setScissor(left, bottom, width, height);
            renderer.setScissorTest(true);
            view.render(width, height);
        });



    }

    addPoints(points) {
        const pointCloud = super.addPoints(points);
        const axis = new Vector3(1, 0, 0);
        const angle = -Math.PI / 2;
        const v3Arr = [];
        points.forEach((pt, i) => {
            const v = pt.clone();
            v.applyAxisAngle(axis, angle);
            v3Arr.push(v);
        });
        this.pointClouds.push(pointCloud);
        return {pointCloud: pointCloud, points: v3Arr};
    }

    // removePoints(points) {
    //     const index = this.pointClouds.indexOf(points);
    //     if (index >= 0) {
    //         this.pointClouds.splice(index, 1);
    //     }
    //     this.scene.remove(points);
    // }
}
