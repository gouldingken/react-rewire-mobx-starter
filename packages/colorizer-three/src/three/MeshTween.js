import {ExtrudeBufferGeometry, Group, Mesh, MeshLambertMaterial, Shape} from "three";

/**
 * Creates a new instance of MeshTween.
 * @class
 * @returns An instance of MeshTween.
 * @example
 * var instance = new MeshTween();
 */
export default class MeshTween {

    constructor(scene) {
        this.displayIndex = 0;
        this.group = new Group();
        scene.add(this.group);
    };

    add(mesh) {
        mesh.visible = this.group.children.length === this.displayIndex;
        this.group.add(mesh);
    }

    updateVisibility() {
        this.group.children.forEach((mesh, i) => {
            mesh.visible = i === this.displayIndex;
        });
    }

    display(index) {
        this.displayIndex = index;
        this.updateVisibility();
    }

    next(wrap) {
        this.displayIndex++;
        if (this.displayIndex >= this.group.children.length) {
            if (wrap) {
                this.displayIndex = 0;
            } else {
                this.displayIndex = this.group.children.length - 1;
            }
        }
        this.updateVisibility();
    }

    prev(wrap) {
        this.displayIndex--;
        if (this.displayIndex < 0) {
            if (wrap) {
                this.displayIndex = this.group.children.length - 1;
            } else {
                this.displayIndex = 0;
            }
        }
        this.updateVisibility();
    }


}
