import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class PositionSelector extends Component {
    render() {
        const {store, children} = this.props;
        const {uiStore} = store;

        let sp_x = uiStore.selectedPosition.x;
        let sp_y = uiStore.selectedPosition.y;
        if (this.positionElem) {
            const rect = this.positionElem.getBoundingClientRect();
            // console.log('RECT POS ', uiStore.selectedPosition, rect)
            sp_x *= rect.width;
            sp_y *= rect.height;
            // if (isNaN(x) || isNaN(y)) {
            //     console.log('NAN ', uiStore.selectedPosition, rect)
            //     x = y = 0;
            // }
        }

        const size = uiStore.canvasSize;
        return (
            <div className="PositionSelector" style={size} ref={(e) => this.positionElem = e}
                 onMouseDown={() => {
                     this.dragging = true;
                 }} onMouseMove={(e) => {
                if (!this.dragging || !this.positionElem) return;
                const rect = this.positionElem.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // console.log('X:', x, e.clientX, rect.left, rect.width, x / rect.width, 1942 * x / rect.width);
                // console.log('Y:', y, e.clientY, rect.top, rect.height, y / rect.height, 1000 * y / rect.height);
                uiStore.setSelectedPosition(x / rect.width, y / rect.height);
            }} onMouseUp={() => {
                this.dragging = false;
            }}>
                {children}
                <div style={{left: sp_x - 5, top: sp_y - 5}}
                     className={'studyPoint'}/>
            </div>
        );
    }
}
observer(PositionSelector);
