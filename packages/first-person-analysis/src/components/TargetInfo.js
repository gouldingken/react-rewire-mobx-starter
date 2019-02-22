import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./SidePanel";
import {If} from "sasaki-core";

export default class TargetInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {targetId, store} = this.props;
        const viewTarget = store.targetStore.getViewTarget(targetId);
        const sketchup = window.sketchup;

        const available = 10000 * viewTarget.currentPoint.available;
        const occluded = 10000 * viewTarget.currentPoint.occluded;
        const max = 200;
        const fullW = 220;
        const availableW = fullW * available / max;
        const occludedW = fullW * (available - occluded) / max;

        const perc = Math.round(1000 * (occluded / available)) / 10;

        return (
            <div className="TargetInfo">
                <div className={'legend-color'} style={{background: viewTarget.color}}/>
                <div className={'legend-title'} >{viewTarget.name}</div>
                {/*A: {Math.round(10000 * viewTarget.currentPoint.available)} |*/}
                {/*O: {Math.round(10000 * viewTarget.currentPoint.occluded)}*/}
                <button className={'set-btn'}
                        onClick={event => sketchup.getSelectedMesh({mode: 'target', targetId: targetId})}>set
                </button>
                <div className={'bar-row'}>
                    <If true={available > 0}>
                        <div className={'percent'}>
                            {perc}%
                        </div>
                    </If>
                    <div className={'bar'}>
                        <div className={'bar-bg'} style={{background: viewTarget.color, width: availableW}}/>
                        <If true={occludedW > 0}>
                            <div className={'bar-over'} style={{left:availableW - occludedW - 1, width: occludedW}}/>
                        </If>
                    </div>
                </div>

            </div>
        );
    }
}

observer(TargetInfo);