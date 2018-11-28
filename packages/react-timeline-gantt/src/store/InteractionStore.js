import {observable, action, decorate} from "mobx";

export default class InteractionStore {
    mousePosition = {x: 0, y: 0};

    setMousePosition(pos) {
        this.mousePosition.x = pos.x;
        this.mousePosition.y = pos.y;
    }

}

decorate(InteractionStore, {
    mousePosition: observable,

    setMousePosition: action,
});
