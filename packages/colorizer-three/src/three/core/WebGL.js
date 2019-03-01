/**
 * Creates a new instance of WebGL.
 * @class
 * @returns An instance of WebGL.
 * @example
 * var instance = new WebGL();
 */
export default class WebGL {

    constructor() {
    };

    static detectWebGLContext () {
        // Create canvas element. The canvas is not added to the
        // document itself, so it is never displayed in the
        // browser window.
        const canvas = document.createElement("canvas");
        // Get WebGLRenderingContext from canvas element.
        const gl = canvas.getContext("webgl")
            || canvas.getContext("experimental-webgl");
        // Report the result.
        return !!(gl && gl instanceof WebGLRenderingContext);
    }
}
