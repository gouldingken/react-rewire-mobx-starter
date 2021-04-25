import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class PositionSelector extends Component {
    render() {
        const {store, children} = this.props;
        const {uiStore} = store;

        return (
            <div className="PositionSelector" ref={(e) => this.positionElem = e} onMouseDown={() => {
                this.dragging = true;
            }} onMouseMove={(e) => {
                if (!this.dragging || !this.positionElem) return;
                const rect = this.positionElem.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                //TODO normalize position within image so that x/y represents image pixels not screen pixels
                uiStore.setSelectedPosition(x, y);
            }} onMouseUp={() => {
                this.dragging = false;
            }}>
                {children}
                <div style={{left: uiStore.selectedPosition.x - 5, top: uiStore.selectedPosition.y - 5}}
                     className={'studyPoint'}/>
            </div>
        );
    }
}
observer(PositionSelector);
