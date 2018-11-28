import React from 'react';
import {observer} from "mobx-react";
import SvgDefs from "./SvgDefs";

export default class InteractableComponent extends React.Component {
    constructor(props) {
        super(props);
        this.boundListeners = {};
    }

    bindListeners(obj) {
        Object.keys(obj).forEach((k) => {
            this.boundListeners[k] = obj[k];
        });

        Object.keys(this.boundListeners).forEach((k) => {
            let boundListener = this.boundListeners[k];
            if (!boundListener.dragOnly) {
                this.withElems(k, (elem, eventName) => {
                    elem.addEventListener(eventName, boundListener.fn);
                });
            }
        });
    }

    componentWillUnmount() {
        Object.keys(this.boundListeners).forEach((k) => {
            this.withElems(k, (elem, eventName) => {
                elem.removeEventListener(eventName, this.boundListeners[k].fn);
            });
        });
    }

    enableDragOnlyListeners() {
        Object.keys(this.boundListeners).forEach((k) => {
            let boundListener = this.boundListeners[k];
            if (boundListener.dragOnly) {
                this.withElems(k, (elem, eventName) => {
                    elem.addEventListener(eventName, boundListener.fn);
                });
            }
        });
    }

    disableDragOnlyListeners() {
        Object.keys(this.boundListeners).forEach((k) => {
            let boundListener = this.boundListeners[k];
            if (boundListener.dragOnly) {
                this.withElems(k, (elem, eventName) => {
                    elem.removeEventListener(eventName, boundListener.fn);
                });
            }
        });
    }

    withElems(k, fn) {
        const boundListener = this.boundListeners[k];
        if (!boundListener.elem) return;
        let eventName = k;
        if (boundListener.event) {
            eventName = boundListener.event;
        }
        if (Array.isArray(boundListener.elem)) {
            boundListener.elem.forEach((elem) => {
                fn(elem, eventName);
            });
        } else {
            fn(boundListener.elem, eventName);
        }
    }


    render() {
        return (
            <div className="InteractableComponent">

            </div>
        );
    }

}
observer(InteractableComponent);