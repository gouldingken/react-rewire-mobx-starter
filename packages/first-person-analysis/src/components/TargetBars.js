import React from 'react';
import {observer} from "mobx-react";
import {If} from "sasaki-core";

export default class TargetBars extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, viewTarget, fullWidth, available, occluded, label, color} = this.props;
        const multiplier = store.uiStore.targetChartMultiplier;
        const max = store.uiStore.targetChartMax * multiplier;
        const availableM = available * multiplier;
        const occludedM = occluded * multiplier;
        const availableW = fullWidth * availableM / max;
        const occludedW = fullWidth * (availableM - occludedM) / max;

        const perc = Math.round(1000 * (occludedM / availableM)) / 10;
        return (
            <div className="TargetBars">
                <If true={availableM > 0}>
                    <div className={'percent'}>
                        {perc}%
                    </div>
                </If>
                <div className={'bar'}>
                    <div className={'bar-bg'} style={{background: color || viewTarget.color, width: availableW}}/>
                    <If true={occludedW > 0}>
                        <div className={'bar-over'} style={{left:availableW - occludedW - 1, width: occludedW}}/>
                    </If>
                </div>
                <If true={label}>
                    <div className={'bar-label'} style={{left:availableW + 55}}>
                        {label}
                    </div>
                </If>

            </div>
        );
    }
}

observer(TargetBars);