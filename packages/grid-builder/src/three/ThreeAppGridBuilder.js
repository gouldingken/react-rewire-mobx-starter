/**
 * Creates a new instance of ThreeAppGridBuilder.
 * @class
 * @returns An instance of ThreeAppGridBuilder.
 * @example
 * var instance = new ThreeAppGridBuilder();
 */
import {ThreeApp} from "colorizer-three";
import {BoxGeometry, DoubleSide, Matrix4, Mesh, MeshPhongMaterial, PlaneGeometry, Vector3} from "three-full";

export default class ThreeAppGridBuilder extends ThreeApp {

    constructor(holder, dataHandler, settings) {
        super(holder, dataHandler, settings);

        this.renderer.setClearColor('#969696');

        this.enableMouseInteraction();

        this.gridCellPlanes = [];

        const blockSize = {x: 8, y: 2};
        const blockCounts = {x: 4, y: 6};

        const colors = [
            '#cce256',
            '#50ceac',
            '#ed7413',
        ];

        const addBlock = (bx, by) => {
            for (let x = 0; x < blockSize.x; x++) {
                for (let y = 0; y < blockSize.y; y++) {
                    this.addGridCell(bx + x, by + y);
                    if (Math.random() < 0.3) {
                        this.addUnit(bx + x, by + y, colors[Math.floor(Math.random() * colors.length)]);
                    }
                }
            }
        };

        for (let x = 0; x < blockCounts.x; x++) {
            for (let y = 0; y < blockCounts.y; y++) {
                addBlock(x * (blockSize.x + 1), y * (blockSize.y + 1));
            }
        }
    };

    addUnit(x, y, color) {
        const material = this.getColoredMaterial(color, 1);
        const geometry = new BoxGeometry(0.5, 0.3, 0.5, 2, 2, 2);
        const cube = new Mesh(geometry, material);
        cube.position.set(x, 0.15, y);

        this.scene.add(cube);
        return cube;
    }

    addGridCell(x, y) {
        const geometry = new PlaneGeometry(0.95, 0.95, 1, 1);
        const material = new MeshPhongMaterial({color: '#e0f8ff', side: DoubleSide});
        const plane = new Mesh(geometry, material);
        plane.rotateX(-Math.PI / 2);
        plane.position.set(x, 0, y);
        plane.userData.defaultMaterial = material;
        plane.userData.highlightColor = '#ffea2a';
        plane.userData.onClick = () => {
            if (!plane.userData.unit) {
                plane.userData.unit = this.addUnit(x, y, '#ff2dc0');
            } else {
                this.scene.remove(plane.userData.unit);
                plane.userData.unit = false;
            }
        };
        this.gridCellPlanes.push(plane);
        this.scene.add(plane);
    }

    updateScene() {
        //if highlighted onInteraction will be called before render, so we clear everything here
        this.gridCellPlanes.forEach((plane, i) => {
            plane.material = plane.userData.defaultMaterial;
        });
    }

    onInteraction(intersects) {

        intersects.forEach((hit, i) => {
            if (hit.object.userData.highlightColor) {
                hit.object.material = this.getColoredMaterial(hit.object.userData.highlightColor, 1);
            }
            if (this.mouse.downEvent) {
                if (hit.object.userData.onClick) {
                    hit.object.material = this.getColoredMaterial('#ffffff', 1);
                    hit.object.userData.onClick();
                }
            }
        });
    }
}
