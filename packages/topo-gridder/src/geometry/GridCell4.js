/**
 * Creates a new instance of GridCell4.
 * @class
 * @returns An instance of GridCell4.
 * @example
 * var instance = new GridCell4();
 */
export default class GridCell4 {

    constructor(parent, x, y, w, h) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.value = 0;
        this.groups = {};
    };

    subdivide() {
        const {x, y, w, h} = this;
        this.children = [
            new GridCell4(this, x, y, w / 2, h / 2),
            new GridCell4(this, x + w / 2, y, w / 2, h / 2),
            new GridCell4(this, x, y + h / 2, w / 2, h / 2),
            new GridCell4(this, x + w / 2, y + h / 2, w / 2, h / 2),
        ];
        return this.children;
    }

    get groupCount() {
        return Object.keys(this.groups).length;
    }

    get variance() {
        const nums = Object.keys(this.groups);
        let min = Number.MAX_VALUE;
        let max = 0;
        nums.forEach((k, i) => {
            let num = parseInt(k);
            min = Math.min(min, num);
            max = Math.max(max, num);
        });
        return max - min;
    }

    canSubdivide() {
        return this.w > 1 && this.h > 1;
    }

    assignValue(v) {
        this.value = 0;
        this.addValue(v);
    }

    addValue(v) {
        // console.log(`Add value: ${v} to ${this.value} [${this.x}, ${this.y}, ${this.w}]`);
        if (this.parent) {
            this.parent.addValue(v);
        }
        this.value += v;
    }

    addToGroup(v) {
        // console.log(`Add value: ${v} to ${this.value} [${this.x}, ${this.y}, ${this.w}]`);
        if (this.parent) {
            this.parent.addToGroup(v);
        }
        if (!this.groups[v]) this.groups[v] = 0;
        this.groups[v]++;
    }
}
