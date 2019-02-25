import React from 'react';
import {observer} from "mobx-react";
import {If} from "sasaki-core";

export default class TargetBars extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, viewTarget, fullWidth, available, unobstructed, label, color} = this.props;
        const max = store.uiStore.targetChartMax;
        const availableM = available;// * multiplier;
        const unobstructedM = unobstructed;// * multiplier;
        const availableW = fullWidth * availableM / max;
        const occludedW = fullWidth * (availableM - unobstructedM) / max;

        const perc = Math.round(1000 * (unobstructedM / availableM)) / 10;
        return (
            <div className="TargetBars">
                <If true={availableM > 0}>
                    <div className={'percent'}>
                        {perc}%
                    </div>
                </If>
                <div className={'bar'}>
                    <div className={'bar-bg'} style={{background: color || viewTarget.color, width: availableW}}
                         title={`Visible Sols: ${Math.round(unobstructed).toLocaleString()} of ${Math.round(available).toLocaleString()}`}/>
                    <If true={occludedW > 0}>
                        <div className={'bar-over'} style={{left: availableW - occludedW - 1, width: occludedW}}
                             title={`Obstructed Sols: ${Math.round(available - unobstructed).toLocaleString()} of ${Math.round(available).toLocaleString()}`}/>
                    </If>
                </div>
                <If true={label}>
                    <div className={'bar-label'} style={{left: availableW + 55}}>
                        {label}
                    </div>
                </If>

            </div>
        );
    }
}

observer(TargetBars);