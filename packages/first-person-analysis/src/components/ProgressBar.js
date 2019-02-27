import React from 'react';
import {observer} from "mobx-react";
import {If} from "sasaki-core";

export default class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {fullWidth, total, progress, color} = this.props;

        let perc = 0;
        let fillW = 0;
        if (total > 0) {
            perc = Math.round(100 * progress / total);
            fillW = fullWidth * progress / total;
        }

        return (
            <div className="ProgressBar">
                <If true={progress > 0}>
                    <div className={'percent'}>
                        {perc}%
                    </div>
                </If>
                <div className={'bar'}>
                    <div className={'bar-outline'} style={{width: fullWidth}}/>
                    <If true={progress > 0}>
                        <div className={'bar-bg'} style={{background: color, width: fillW}}/>
                    </If>
                </div>
            </div>
        );
    }
}

observer(ProgressBar);