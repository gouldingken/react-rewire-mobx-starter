const rison = require('rison');// another option: https://www.npmjs.com/package/juri
/**
 * Creates a new instance of DeepLinks.
 * @class
 * @returns An instance of DeepLinks.
 * @example
 * var instance = new DeepLinks();
 */
export default class DeepLinks {

    constructor() {
        window.addEventListener('hashchange', ()=> this.onHashChange(window.location.hash));
    };

    setHashData(data) {
        history.replaceState(undefined, undefined, "#"+rison.encode(data))
    }

    onHashChange(hash) {
        this.onData(rison.decode(hash.substr(1)));
    }

    onData(data) {
        //for override
    }
}
