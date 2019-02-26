'use strict';
import Emitter from "sasaki-core/src/Emitter";

/**
 * Creates a new instance of ADataHandler.
 * @class
 * @returns An instance of ADataHandler.
 * @example
 * var instance = new ADataHandler();
 */
export default class ADataHandler extends Emitter {

    constructor() {
        super();
    };

    getColor(id) {
        return false;
    }

    setTime(time) {
        return false;
    }

    get useObjLoader() {
        return false;
    }

    get useExtrudes() {
        return false;
    }

}
