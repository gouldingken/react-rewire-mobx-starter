import React, {Component} from 'react';
import {observer} from "mobx-react";
import CumulativeBar from "./CumulativeBar";

function HourPie(props) {
    const {slices} = props;
    const palette = {
        'sun': '#f1f4ff',
        'new': '#8f40ff',
        'shade': '#6f7590',
    };
    const pieSlices = slices.map((slice) => {
        return {
            percent: 1 / slices.length,
            color: palette[slice]
        }
    });

    const r = 1;

    function getCoordinatesForPercent(percent) {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }


    let cumulativePercent = 0;
    const renderPiece = (slice) => {
        const [startX, startY] = getCoordinatesForPercent(cumulativePercent);

        // each slice starts where the last slice ended, so keep a cumulative percent
        cumulativePercent += slice.percent;

        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

        // if the slice is more than 50%, take the large arc (the long way around)
        const largeArcFlag = slice.percent > .5 ? 1 : 0;

        // create an array and join it just for code readability
        const pathData = [
            `M ${startX} ${startY}`, // Move
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `L 0 0`, // Line
        ].join(' ');

        return <path key={cumulativePercent} d={pathData} fill={slice.color} stroke={'#ffffff'} strokeWidth={0.05}/>;
    }

// transform={`translate(${r},${r*2})`}
    return (
        <svg className="HourPie" width={50} height={50} viewBox="-1 -1 2 2">
            <g transform={'rotate(-90)'}>
                {pieSlices.map((slice) => renderPiece(slice))}
            </g>
        </svg>
    );
}

export default class DayClock extends Component {
    render() {
        const {store} = this.props;
        if (!store.bitmaskData) {
            return null;
        }
        //TODO replace option1 with prop
        if (!store.bitmaskData.context || !store.bitmaskData.option1) {
            return null;
        }
        const diff = store.bitmaskData.option1.hrs - store.bitmaskData.context.hrs;
        const x = store.uiStore.selectedPosition.x * 1942;
        const y = store.uiStore.selectedPosition.y * 1000;

        const byHour = {};
        const minuteStep = 3;
        const stepsPerHour = 60 / minuteStep;
        let existingBitmask = store.bitmaskData.context.shadowsBitmask;
        let newBitmask = store.bitmaskData.option1.shadowsBitmask;
        for (let i = 0; i < existingBitmask.length; i++) {
            const hour = Math.floor(i / stepsPerHour);//Note assumes starting on hour...
            if (!byHour[hour]) {
                byHour[hour] = [];
            }
            let cond = 'sun';
            if (newBitmask[i] === '1') {
                cond = 'new';//will be overridden if existing below
            }
            if (existingBitmask[i] === '1') {
                cond = 'shade';
            }
            byHour[hour].push(cond);
        }

        let diffDisplay = Math.round(100 * diff) / 100;
        return (
            <div className="DayClock">
                {Object.keys(byHour).map((k) => <HourPie key={k} slices={byHour[k]}/>)}

                <div>
                    <CumulativeBar width={500} totalHours={diff}/>
                    <div className={'new-hrs'}>{diffDisplay} hr{diffDisplay === 1 ? '' : 's'} of new shadow
                    </div>
                </div>
                {/*<div>{x}, {y}: {diff}</div>*/}
                {/*{JSON.stringify(store.bitmaskData)}*/}
            </div>
        );
    }

}
observer(DayClock);
