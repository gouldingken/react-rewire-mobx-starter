/**
 * Creates a new instance of TopoSampler.
 * @class
 * @returns An instance of TopoSampler.
 * @example
 * var instance = new TopoSampler();
 */
import {Delaunay} from "d3-delaunay";
import GridCell4 from "./GridCell4";

export default class TopoSampler {

    constructor(img) {
        this.img = img;
        this.scale = 1;
    };

    getPixelData(width, height) {
        const {img} = this;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, img.width, img.height);
        const imgd = context.getImageData(0, 0, width, height);
        const pix = imgd.data;

        const n = pix.length;
        const pixelData = [];
        for (let i = 0; i < n; i += 4) {
            const grey = pix[i];
            pixelData.push(grey);
        }

        return (x, y) => {
            x = Math.round(x);
            y = Math.round(y);
            return pixelData[y * width + x];
        };
    }

    generate() {
        const dim = 128;
        const gridCell = new GridCell4(null, 0, 0, dim, dim);

        this.grayScale = this.getPixelData(dim, dim);
        const subdivide = (pCell) => {
            if (pCell.canSubdivide()) {
                const cells = pCell.subdivide();
                cells.forEach((cell, i) => {
                    subdivide(cell);
                });
            } else {
                pCell.addToGroup(this.grayScale(pCell.x, pCell.y));
            }
        };

        subdivide(gridCell);
        this.rootCell = gridCell;
    }

    createPoints(threshold) {
        const {scale} = this;
        const rectangles = [];
        const iterateChildren = (pCell) => {
            // console.log(pCell.x, pCell.y, pCell.w, pCell.groupCount);
            // if (pCell.groupCount < threshold) {
            if (pCell.variance < threshold) {
                rectangles.push(pCell);
                return;
            }
            if (pCell.children) {
                pCell.children.forEach((child, i) => {
                    iterateChildren(child);
                });
            }
        };

        iterateChildren(this.rootCell);

        const fillZone = 0.4;
        const points = [];
        rectangles.forEach((rect, i) => {
            const offset = {
                x: (fillZone * (0.5 - Math.random())) * rect.w * scale,
                y: (fillZone * (0.5 - Math.random())) * rect.h * scale,
            };
            const cellCenter = {
                x: rect.x * scale + (rect.w * scale) / 2,
                y: rect.y * scale + (rect.h * scale) / 2
            };
            points.push([
                cellCenter.x + offset.x,
                cellCenter.y + offset.y
            ]);
        });
        return points;
    }

    triangulate(threshold) {
        const samplePoints = this.createPoints(threshold);
        const delaunay = Delaunay.from(samplePoints);

        const {points, triangles} = delaunay;

        const vertices = [];
        const faces = [];
        for (let i = 0; i < points.length; i += 2) {
            let x = points[i];
            let y = points[i + 1];
            vertices.push(x, y, this.grayScale(x, y) / 30);//TODO height scale
        }
        for (let i = 0; i < triangles.length; i += 3) {
            const t0 = triangles[i + 0];//index of point (not position within point array)
            const t1 = triangles[i + 1];
            const t2 = triangles[i + 2];
            // faces.push(0, t0 * 3, t1 * 3, t2 * 3);
            faces.push(0, t0, t1, t2);
            //TODO triangle indices reference points in x,y array, we need to also include and extra point
            //as well as the leading zero (to represent 'triangle'
            // context.moveTo(points[t0 * 2], points[t0 * 2 + 1]);
            // context.lineTo(points[t1 * 2], points[t1 * 2 + 1]);
            // context.lineTo(points[t2 * 2], points[t2 * 2 + 1]);
            // context.closePath();
        }

        const speckleMesh = {
            //TEMP vertices
            "vertices": vertices,// [-199.57300831186876,5888.154048053762,-1.5664328953439488e-23,-199.57300831186876,5888.154048053762,-1.5664328953439488e-23,-3942.803569141266,10613.80646701975,-4.247969101585633e-18,-11108.553569141266,10613.80646701975,-4.247969101585633e-18,-17577.436117272882,18058.101842740558,-3.637978807091713e-12,10837.23024344943,18058.101842740558,-3.637978807091713e-12,2137.8644916881312,5888.154048053762,-1.5664328953439488e-23],
            "faces": faces,//[0,0,1,2,0,1,0,3,0,3,0,4,0,4,0,5],//TEMP faces
            "colors": ["#65ffff"],
            "textureCoordinates": [],
            "type": "Mesh",
            "hash": "e57e0b24-eeae-426b-8e2d-0292a4abdbb1",
            "geometryHash": "Mesh.e57e0b24-eeae-426b-8e2d-0292a4abdbb1",
            "name": "Lake",
            "children": [],
            "ancestors": [],
            "transform": [],
            "private": false,
            "deleted": false,
            "canRead": [],
            "canWrite": [],
            "comments": []
        };

        return speckleMesh;
    }
}
