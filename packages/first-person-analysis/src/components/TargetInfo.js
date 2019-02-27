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

        let className = 'TargetInfo';

        if (store.uiStore.selectedReviewTarget === targetId) {//store.uiStore.mode === 'review' &&
            className += ' selected';
        }

        let select = () => {
            store.uiStore.setSelectedReviewTarget(targetId);
        };
        return (
            <div className={className}>
                <div className={'legend-color'} style={{background: viewTarget.color}} onClick={select}/>
                <div className={'legend-title'} onClick={select}>{viewTarget.name}</div>

                <If true={store.uiStore.mode === 'analyze'}>
                    <button className={'set-btn'}
                            onClick={event => sketchup.getSelectedMesh({mode: 'target', targetId: targetId})}>set
                    </button>
                </If>
                <TargetBars fullWidth={fullW} store={store} viewTarget={viewTarget} available={available}
                            unobstructed={unobstructed}/>

            </div>
        );
    }
}

observer(TargetInfo);