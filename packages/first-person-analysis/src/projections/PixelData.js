/**
 * Creates a new instance of PixelData.
 * @class
 * @returns An instance of PixelData.
 * @example
 * var instance = new PixelData();
 */
export default class PixelData {

    constructor() {
    };

    static saveImage = function (name, pixels, width, height) {
        const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob(function (blob) {

            const url = URL.createObjectURL(blob);
            const fileName = name + '-' + Date.now() + '.png';
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.setAttribute("download", fileName);
            anchor.className = "download-js-link";
            anchor.innerHTML = "downloading...";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            setTimeout(function () {
                anchor.click();
                document.body.removeChild(anchor);
            }, 1);

        }, 'image/png');

    };
}
