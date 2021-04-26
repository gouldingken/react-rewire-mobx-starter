/**
 * Creates a new instance of BitMaskSet.
 * @class
 * @returns An instance of BitMaskSet.
 * @example
 * var instance = new BitMaskSet();
 */
export default class BitMaskSet {

    constructor(dir) {
        this.dir = dir;
        this.images = [];
        this.imageList = [];
        this.miniCanvas = new OffscreenCanvas(1, 1);
        this.imageSize = {};
    };

    async loadPng(i, src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.images[i] = image;
                if (!this.imageSize.width) {
                    this.imageSize.width = image.width;
                    this.imageSize.height = image.height;
                } else {
                    if (this.imageSize.width !== image.width || this.imageSize.height !== image.height) {
                        console.warn('Mismatched images', src, this.imageSize, image.width, image.height);
                    }
                }
                resolve();
            }
            image.src = src;
        });
    }

    async loadFiles(imageList) {
        this.imageList = imageList;
        for (let i = 0; i < imageList.length; i += 24) {//24 bits available for RGB (alpha not reliable)
            await this.loadPng(i, `${this.dir}/bitmask_${i}.png`);
        }
    }

    getShadowsBitmask(xN, yN) {
        let x = Math.floor(xN * this.imageSize.width);
        let y = Math.floor(yN * this.imageSize.height);

        function byteString(n) {
            return ("000000000" + n.toString(2)).substr(-8)
        }

        const ctx = this.miniCanvas.getContext('2d');
        let bitmask = '';
        this.images.forEach((image, i) => {
            //Note: not sure which is faster... keeping a full canvas and querying - or just rendering image to 1x1 canvas
            //this uses the latter approach
            ctx.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            bitmask += byteString(r) + byteString(g) + byteString(b);
        });
        return bitmask.substr(0, this.imageList.length);//there are a bunch of extra 1s at the end that need to be truncated
    }


}
