/**
 * Creates a new instance of ViewDataReader.
 * @class
 * @returns An instance of ViewDataReader.
 * @example
 * var instance = new ViewDataReader();
 */
export default class ViewDataReader {

    constructor(scene, reprojector) {
        this.scene = scene;
        this.reprojector = reprojector;
        this.cylinderMode = true;
        this.obstructionMeshes = [];
        this._obstructionVisibility = true;
    };

    setObstructionVisibility(visible) {
        this._obstructionVisibility = visible;
    }

    addObstructionMesh(mesh) {
        this.obstructionMeshes.push(mesh);
    }

    showObstructionMeshes(visible) {
        if (!this.obstructionMeshes) return;
        this.obstructionMeshes.forEach(function (mesh, i) {
            mesh.visible = visible && !mesh.userData.excluded;;
        });

    }

    readForPositions(positions) {
        // this.scene.autoUpdate = false;//TEMP
        const pixelSets = {};

        this.showObstructionMeshes(false);
        this.reprojector.invalidate();
        pixelSets.base = this.reprojector.calculateAreas(positions, this.scene);

        this.showObstructionMeshes(true);
        this.reprojector.invalidate();
        pixelSets.obstructed = this.reprojector.calculateAreas(positions, this.scene);

        // this.scene.autoUpdate = true;//TEMP

        // this.showObstructionMeshes(this._obstructionVisibility);
        this.showObstructionMeshes(this._obstructionVisibility);
        return pixelSets;
    }

    readSensors(readingList) {

        const positions = readingList.map((sensor) => sensor.position);
        const pixelSets = this.readForPositions(positions);

        const channels = ['r', 'g', 'b'];
        for (let i = 0; i < readingList.length; i++) {
            const baseVals = this.reportCounts(pixelSets.base[i]);
            const obstructedVals = this.reportCounts(pixelSets.obstructed[i]);
            const sensor = readingList[i];
            sensor.values = {};
            channels.forEach(function (c, j) {
                const v1 = baseVals[c];
                const v2 = obstructedVals[c];
                sensor.values['c' + (j + 1)] = {o: v2, f: v1};
            });

            sensor.maxPixel = obstructedVals.maxPixel;
        }
    }

    reportCounts(pixelSet) {
        const pixels = pixelSet.pixels;
        const imageW = pixelSet.reducedSize.Width;
        const imageH = pixelSet.reducedSize.Height;
        let n = pixels.length;
        let countRed = 0;
        let countGreen = 0;
        let countBlue = 0;
        let maxPixel = {value: 0};

        for (let i = 0; i < n; i += 4) {
            if (pixels[i] > 0) {
                countRed += pixels[i] / 255;
            }
            if (pixels[i + 1] > 0) {
                countGreen += pixels[i + 1] / 255;
            }
            if (pixels[i + 2] > 0) {
                countBlue += pixels[i + 2] / 255;
            }
            const value = pixels[i] + pixels[i + 1] + pixels[i + 2];
            if (value > 0) {
                if (value > maxPixel.value) {
                    maxPixel.indices = [i / 4];
                    maxPixel.value = value
                } else if (value === maxPixel.value) {
                    maxPixel.indices.push(i / 4);
                }
            }
        }
        let max;
        if (this.cylinderMode) {
            max = n / 4;
        } else {
            const circleToSquare = Math.PI / 4;
            max = circleToSquare * n / 4;
        }

        const ans = {r: countRed / max, g: countGreen / max, b: countBlue / max};
        if (imageW && maxPixel.value > 0) {
            const sums = {x: 0, y: 0};
            maxPixel.indices.forEach(function (index, i) {
                sums.x += (index % imageW) / imageW;
                sums.y += Math.floor(index / imageW) / imageH;
            });
            ans.maxPixel = {
                x: sums.x / maxPixel.indices.length,
                y: sums.y / maxPixel.indices.length,
            };

            //TODO check that the maxPixel falls on an actual pixel (not in a blank area between)
            //if not, find the closest pixel in the list and return that one
        }
        return ans;
    };
}
