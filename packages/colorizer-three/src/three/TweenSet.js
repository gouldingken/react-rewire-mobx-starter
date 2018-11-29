/**
 * Creates a new instance of TweenSet.
 * @class
 * @returns An instance of TweenSet.
 * @example
 * var instance = new TweenSet();
 */
export default class TweenSet {

    constructor(fromKey, toKey) {
        this.tweenDir = 0;
        this.displayIndex = 0;
        this.meshes = [];
        this.fromKey = fromKey;
        this.toKey = toKey;
        this.visible = false;
    };

    add(mesh) {
        mesh.visible = this.visible && this.meshes.length === this.displayIndex;
        this.meshes.push(mesh);
    }

    updateVisibility() {
        this.meshes.forEach((mesh, i) => {
            mesh.visible = this.visible && i === this.displayIndex;
        });
    }

    setVisible(val) {
        this.visible = val;
        this.updateVisibility();
    }

    display(index) {
        this.displayIndex = index;
        this.updateVisibility();
    }

    next(wrap) {
        const prevIndex = this.displayIndex;
        this.displayIndex++;
        if (this.displayIndex >= this.meshes.length) {
            if (wrap) {
                this.displayIndex = 0;
            } else {
                this.displayIndex = this.meshes.length - 1;
            }
        }
        this.updateVisibility();
        return prevIndex !== this.displayIndex;
    }

    prev(wrap) {
        const prevIndex = this.displayIndex;
        this.displayIndex--;
        if (this.displayIndex < 0) {
            if (wrap) {
                this.displayIndex = this.meshes.length - 1;
            } else {
                this.displayIndex = 0;
            }
        }
        this.updateVisibility();
        return prevIndex !== this.displayIndex;
    }

    setActiveKey(key) {
        if (key === this.fromKey) {
            this.tweenDir = -1;
        }
        if (key === this.toKey) {
            this.tweenDir = 1;
        }
    }

    tick() {
        if (this.tweenDir > 0) {
            return this.next(false);
        }
        if (this.tweenDir < 0) {
            return this.prev(false);
        }
        return false;
    }

}
