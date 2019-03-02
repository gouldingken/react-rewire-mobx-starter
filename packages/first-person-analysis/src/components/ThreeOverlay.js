import React from 'react';
import {autorun} from "mobx";
import {observer} from "mobx-react";
import CanvasComponent from "./charts/CanvasComponent";

export default class ThreeOverlay extends CanvasComponent {
    static defaultProps = {
        width: 1200,
        height: 1200,
    };

    constructor(props) {
        super(props);
        const {targetStore, uiStore, optionsStore, readingsStore} = this.props.store;

        autorun(() => {
            // console.log('AUTORUN '+JSON.stringify(targetStore.viewTargets))
            this.redrawCanvas(uiStore.selectionPoints2D);//hack to trigger change...
        });
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
    }

    render() {
        const {width, height} = this.props;

        this.redrawCanvas();
        return (
            <div className={'ThreeOverlay'}>
                <canvas ref={(e) => this.canvas = e} width={width} height={height}/>
            </div>
        );
    }

    redrawCanvas(selectionPoints2D) {
        if (!this.ctx) return;
        const {store, width, height} = this.props;

        // noinspection SillyAssignmentJS
        this.canvas.width = this.canvas.width;//clear
        const size = {w: width, h: height};
        // this.ctx.clearRect(0, 0, size.w, size.h);

        if (selectionPoints2D) {
            selectionPoints2D.forEach((pos, i) => {
                this.drawCircle({cx: pos.x, cy: pos.y, r: 8}, '#333333');
                this.drawCircle({cx: pos.x, cy: pos.y, r: 6}, '#ffffff');
            });
        }
    }
}


observer(ThreeOverlay);