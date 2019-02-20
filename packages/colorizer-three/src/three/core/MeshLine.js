//ported to ES6 from https://raw.githubusercontent.com/spite/MeshLine/master/src/MeshLine.js
import {BufferAttribute, BufferGeometry, Geometry} from "three-full";

class MeshLine {
    constructor() {
        this.positions = [];

        this.previous = [];
        this.next = [];
        this.side = [];
        this.width = [];
        this.indices_array = [];
        this.uvs = [];
        this.counters = [];
        this.geometry = new BufferGeometry();

        this.widthCallback = null;
    }

    setGeometry(g, widthCallback) {

        let j;
        this.widthCallback = widthCallback;

        this.positions = [];
        this.counters = [];

        if (g instanceof Geometry) {
            for (j = 0; j < g.vertices.length; j++) {
                const v = g.vertices[j];
                const c = j / g.vertices.length;
                this.positions.push(v.x, v.y, v.z);
                this.positions.push(v.x, v.y, v.z);
                this.counters.push(c);
                this.counters.push(c);
            }
        }

        if (g instanceof BufferGeometry) {
            // read attribute positions ?
        }

        if (g instanceof Float32Array || g instanceof Array) {
            for (j = 0; j < g.length; j += 3) {
                const c = j / g.length;
                this.positions.push(g[j], g[j + 1], g[j + 2]);
                this.positions.push(g[j], g[j + 1], g[j + 2]);
                this.counters.push(c);
                this.counters.push(c);
            }
        }

        this.process();

    }

    compareV3(a, b) {

        const aa = a * 6;
        const ab = b * 6;
        return (this.positions[aa] === this.positions[ab]) && (this.positions[aa + 1] === this.positions[ab + 1]) && (this.positions[aa + 2] === this.positions[ab + 2]);

    }

    copyV3(a) {

        const aa = a * 6;
        return [this.positions[aa], this.positions[aa + 1], this.positions[aa + 2]];

    }

    process() {

        let j;
        const l = this.positions.length / 6;

        this.previous = [];
        this.next = [];
        this.side = [];
        this.width = [];
        this.indices_array = [];
        this.uvs = [];

        for (j = 0; j < l; j++) {
            this.side.push(1);
            this.side.push(-1);
        }

        let w;
        for (j = 0; j < l; j++) {
            if (this.widthCallback) w = this.widthCallback(j / (l - 1));
            else w = 1;
            this.width.push(w);
            this.width.push(w);
        }

        for (j = 0; j < l; j++) {
            this.uvs.push(j / (l - 1), 0);
            this.uvs.push(j / (l - 1), 1);
        }

        let v;

        if (this.compareV3(0, l - 1)) {
            v = this.copyV3(l - 2);
        } else {
            v = this.copyV3(0);
        }
        this.previous.push(v[0], v[1], v[2]);
        this.previous.push(v[0], v[1], v[2]);
        for (j = 0; j < l - 1; j++) {
            v = this.copyV3(j);
            this.previous.push(v[0], v[1], v[2]);
            this.previous.push(v[0], v[1], v[2]);
        }

        for (j = 1; j < l; j++) {
            v = this.copyV3(j);
            this.next.push(v[0], v[1], v[2]);
            this.next.push(v[0], v[1], v[2]);
        }

        if (this.compareV3(l - 1, 0)) {
            v = this.copyV3(1);
        } else {
            v = this.copyV3(l - 1);
        }
        this.next.push(v[0], v[1], v[2]);
        this.next.push(v[0], v[1], v[2]);

        for (j = 0; j < l - 1; j++) {
            const n = j * 2;
            this.indices_array.push(n, n + 1, n + 2);
            this.indices_array.push(n + 2, n + 1, n + 3);
        }

        if (!this.attributes) {
            this.attributes = {
                position: new BufferAttribute(new Float32Array(this.positions), 3),
                previous: new BufferAttribute(new Float32Array(this.previous), 3),
                next: new BufferAttribute(new Float32Array(this.next), 3),
                side: new BufferAttribute(new Float32Array(this.side), 1),
                width: new BufferAttribute(new Float32Array(this.width), 1),
                uv: new BufferAttribute(new Float32Array(this.uvs), 2),
                index: new BufferAttribute(new Uint16Array(this.indices_array), 1),
                counters: new BufferAttribute(new Float32Array(this.counters), 1)
            }
        } else {
            this.attributes.position.copyArray(new Float32Array(this.positions));
            this.attributes.position.needsUpdate = true;
            this.attributes.previous.copyArray(new Float32Array(this.previous));
            this.attributes.previous.needsUpdate = true;
            this.attributes.next.copyArray(new Float32Array(this.next));
            this.attributes.next.needsUpdate = true;
            this.attributes.side.copyArray(new Float32Array(this.side));
            this.attributes.side.needsUpdate = true;
            this.attributes.width.copyArray(new Float32Array(this.width));
            this.attributes.width.needsUpdate = true;
            this.attributes.uv.copyArray(new Float32Array(this.uvs));
            this.attributes.uv.needsUpdate = true;
            this.attributes.index.copyArray(new Uint16Array(this.indices_array));
            this.attributes.index.needsUpdate = true;
        }

        this.geometry.addAttribute('position', this.attributes.position);
        this.geometry.addAttribute('previous', this.attributes.previous);
        this.geometry.addAttribute('next', this.attributes.next);
        this.geometry.addAttribute('side', this.attributes.side);
        this.geometry.addAttribute('width', this.attributes.width);
        this.geometry.addAttribute('uv', this.attributes.uv);
        this.geometry.addAttribute('counters', this.attributes.counters);

        this.geometry.setIndex(this.attributes.index);

    }

    /**
     * Fast method to advance the line by one position.  The oldest position is removed.
     * @param position
     */
    advance(position) {
        function memcpy(src, srcOffset, dst, dstOffset, length) {
            var i;

            src = src.subarray || src.slice ? src : src.buffer;
            dst = dst.subarray || dst.slice ? dst : dst.buffer;

            src = srcOffset ? src.subarray ?
                src.subarray(srcOffset, length && srcOffset + length) :
                src.slice(srcOffset, length && srcOffset + length) : src;

            if (dst.set) {
                dst.set(src, dstOffset)
            } else {
                for (i = 0; i < src.length; i++) {
                    dst[i + dstOffset] = src[i]
                }
            }

            return dst
        }

        const positions = this.attributes.position.array;
        const previous = this.attributes.previous.array;
        const next = this.attributes.next.array;
        const l = positions.length;

        // PREVIOUS
        memcpy(positions, 0, previous, 0, l);

        // POSITIONS
        memcpy(positions, 6, positions, 0, l - 6);

        positions[l - 6] = position.x;
        positions[l - 5] = position.y;
        positions[l - 4] = position.z;
        positions[l - 3] = position.x;
        positions[l - 2] = position.y;
        positions[l - 1] = position.z;

        // NEXT
        memcpy(positions, 6, next, 0, l - 6);

        next[l - 6] = position.x;
        next[l - 5] = position.y;
        next[l - 4] = position.z;
        next[l - 3] = position.x;
        next[l - 2] = position.y;
        next[l - 1] = position.z;

        this.attributes.position.needsUpdate = true;
        this.attributes.previous.needsUpdate = true;
        this.attributes.next.needsUpdate = true;

    };
}
export default MeshLine;

