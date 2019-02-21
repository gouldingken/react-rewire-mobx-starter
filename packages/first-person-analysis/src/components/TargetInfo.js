import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./SidePanel";

export default class TargetInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {targetId, store} = this.props;
        const viewTarget = store.targetStore.getViewTarget(targetId);
        const sketchup = window.sketchup;

        return (
            <div className="TargetInfo">
                <div className={'legend-color'} style={{background: viewTarget.color}}/>
                {viewTarget.name}
                <button className={'action-btn'} onClick={event => sketchup.getSelectedMesh({mode:'target', targetId:targetId})}>set</button>
            </div>
        );
    }
}

observer(TargetInfo);