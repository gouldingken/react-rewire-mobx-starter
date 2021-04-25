export const loadFromSrc = async (src) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = function () {
            resolve(image);
        };
    });
}
