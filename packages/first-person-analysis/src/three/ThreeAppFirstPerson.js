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
import {BoxGeometry, Matrix4, Mesh, Vector3} from "three-full";

export default class ThreeAppFirstPerson extends ThreeApp {

    constructor(holder, dataHandler, settings) {
        super(holder, dataHandler, settings);
        const channels = {
            channel1: '#ffdf1c',
            channel2: '#d16cff',
            channel3: '#50d0d3',
        };
        this.studyPoints = [];
        this.pointClouds = [];
        this.extras = [];

        const material = this.getColoredMaterial('#00ff00', 1);
        const camPosGeom = new BoxGeometry(10, 10, 10, 1, 1, 1);
        this.cubeCamPos = new Mesh(camPosGeom, material);
        this.scene.add(this.cubeCamPos);

        this.reprojector = new CubemapReprojector(this.renderer, 512, channels, true, true);
        this.viewDataReader = new ViewDataReader(this.scene, this.reprojector);
    };

    updateScene() {
        this.studyPos = this.nextStudyPos();
        this.cubeCamPos.position.copy(this.getStudyPos());
        this.readData();
    }

    nextStudyPos() {
        if (this.studyPoints.length > 0) {
            const index = this.dataHandler.updateStudyPos();
            if (this.studyPoints[index]) {
                return this.studyPoints[index];
            }
        }
        return new Vector3();
        // return new Vector3(10, 5 + 5 * Math.sin(this.incrementor / 100), 10);
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
        this.pointClouds.forEach((pointCloud, i) => {
            pointCloud.visible = visible && !pointCloud.userData.excluded;
        });
        this.extras.forEach((extra, i) => {
            extra.visible = visible  && !extra.userData.excluded;
        });
        this.cubeCamPos.visible = visible;
    }

    addExtras(extras) {
        extras.forEach((extra, i) => {
            this.extras.push(extra);
        });
    }

    renderScene() {
        const bottomPaneHeight = this.size.width / this.reprojector.aspectRatio;
        const split = 1 - bottomPaneHeight / this.size.height;

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
                    this.reprojector.display(this.getStudyPos(), scene);
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
        points.forEach((pt, i) => {
            const v = new Vector3(pt[0], pt[1], pt[2]);
            v.applyAxisAngle(axis, angle);
            this.studyPoints.push(v);
        });
        this.pointClouds.push(pointCloud);
        return pointCloud;
    }
}
