import React, {Component} from 'react';
import {observer} from "mobx-react";

function BackgroundColors(props) {
    const {width, height, palette} = props;
    return <g>
        {palette.map((color, i) => <rect
            key={color} x={width * i / palette.length} fill={color} width={width / palette.length}
            height={height}
        />)}
    </g>;
}

export default class CumulativeBar extends Component {
    render() {
        const {totalHours, width} = this.props;
        const palette = [
            '#ffffff',
            '#ffffe0',
            '#ffe0a9',
            '#ffbe84',
            '#ff0000',
            '#e60004',
            '#ce000e',
            '#b80019',
            '#a00026',
            '#880035',
            '#6e004a',
            '#4e0063',
            '#000080',
        ];
        const paletteStep = 1 / 4;//hours
        const height = 30;
        const cSteps = totalHours / paletteStep;
        return (
            <div className="CumulativeBar">
                <svg width={width} height={height}>
                    <BackgroundColors palette={palette} width={width} height={height}/>
                    <rect
                        fill={'#000000'} y={10} height={10} width={width * cSteps / palette.length}
                    />
                </svg>
            </div>
        );
    }

}
// observer(CumulativeBar);
