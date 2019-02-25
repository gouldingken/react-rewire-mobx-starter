import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./SidePanel";
import {If} from "sasaki-core";
import TargetBars from "./TargetBars";

export default class TargetInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {targetId, store} = this.props;
        const viewTarget = store.targetStore.getViewTarget(targetId);
        const sketchup = window.sketchup;

        const fullW = 180;
        const available = viewTarget.currentPoint.available;
        const unobstructed = viewTarget.currentPoint.unobstructed;

        return (
            <div className="TargetInfo">
                <div className={'legend-color'} style={{background: viewTarget.color}}/>
                <div className={'legend-title'}>{viewTarget.name}</div>
                {/*A: {Math.round(10000 * viewTarget.currentPoint.available)} |*/}
                {/*O: {Math.round(10000 * viewTarget.currentPoint.unobstructed)}*/}
                <button className={'set-btn'}
                        onClick={event => sketchup.getSelectedMesh({mode: 'target', targetId: targetId})}>set
                </button>
                <TargetBars fullWidth={fullW} store={store} viewTarget={viewTarget} available={available} unobstructed={unobstructed}/>

            </div>
        );
    }
}

observer(TargetInfo);