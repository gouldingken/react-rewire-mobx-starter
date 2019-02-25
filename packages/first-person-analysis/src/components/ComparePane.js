import React from 'react';
import {observer} from "mobx-react";
import TargetBars from "./TargetBars";

export default class ComparePane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store} = this.props;
        const viewTarget1 = store.targetStore.getViewTarget('target1');
        const viewTarget2 = store.targetStore.getViewTarget('target2');
        const viewTarget3 = store.targetStore.getViewTarget('target3');

        const allReadings = store.readingsStore.summarizeReadings();

        const getOptionData = (targetId) => {
            return allReadings.map((data, i) => {
                const option = store.optionsStore.getOption(data.option);
                return {
                    option: option,
                    occluded: data.values.sums.occluded[targetId] / data.values.count,
                    available: data.values.sums.available[targetId] / data.values.count,
                    occludedPoints: data.values.sorted.occluded[targetId]
                };
            });
        };

        return (
            <div className="ComparePane">
                <CompareGroup store={store} viewTarget={viewTarget1} optionData={getOptionData('target1')}/>
                <CompareGroup store={store} viewTarget={viewTarget2} optionData={getOptionData('target2')}/>
                <CompareGroup store={store} viewTarget={viewTarget3} optionData={getOptionData('target3')}/>

            </div>
        );
    }
}

class CompareGroup extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, viewTarget, optionData} = this.props;

        const chartData = [];
        optionData.forEach((optionDatum, i) => {
            const chartXYs = [];
            optionDatum.occludedPoints.forEach((val, i) => {
                chartXYs.push([i, val]);
            });
            chartData.push({label: optionDatum.name, color: optionDatum.option.chartColor, data: chartXYs});
        });

        return (
            <div className={'compare-group'}>
                <div>{viewTarget.name}</div>
                {optionData.map((optionDatum) =>
                    <TargetBars key={optionDatum.option.key} fullWidth={600} store={store} viewTarget={viewTarget}
                                label={optionDatum.option.name}
                                available={optionDatum.available} occluded={optionDatum.occluded}
                                color={optionDatum.option.chartColor}/>
                )}

                <div
                    style={{
                        width: "400px",
                        height: "300px"
                    }}
                >
                    <Chart
                        data={chartData}
                    />
                </div>
            </div>
        );
    }
}

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.padding = {top: 2, bottom: 10, left: 10, right: 2};
        this.endLineTick = {size: 7};
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.drawData(this.props.data);
    }

    render() {
        const {data} = this.props;

        this.drawData(data);
        return (<canvas ref={(e) => this.canvas = e} width={400} height={300}/>);
    }

    drawData(data) {
        if (!data) return;
        if (!this.ctx) return;
        const size = {w: 400, h: 300};
        this.ctx.clearRect(0, 0, size.w, size.h);

        this.calcMax(data);

        data.forEach((series, i) => {
            this.drawSeries(series.data, size, series.color);
        });
    }

    calcMax(data) {
        this.maxY = 0;
        this.maxX = 0;
        data.forEach((series, i) => {
            series.data.forEach((datum, i) => {
                this.maxY = Math.max(datum[1], this.maxY);
                this.maxX = Math.max(datum[0], this.maxX);
            });
        });
    }

    drawSeries(data, size, color) {
        let maxX = this.maxX;
        let maxY = this.maxY;

        const plotW = size.w - this.padding.left - this.padding.right;
        const plotH = size.h - this.padding.top - this.padding.bottom;
        const plot = (x, y) => {
            return {
                x: this.padding.left + plotW * (x / maxX),
                y: this.padding.top + plotH - plotH * (y / maxY)
            };
        };
        this.ctx.beginPath();
        let pos;
        data.forEach((datum, i) => {
            pos = plot(datum[0], datum[1]);
            if (i === 0) {
                this.ctx.moveTo(pos.x, pos.y);
            } else {
                this.ctx.lineTo(pos.x, pos.y);
            }
        });
        if (this.endLineTick && pos) {
            this.ctx.lineTo(pos.x, pos.y + this.endLineTick.size);
        }
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
}

observer(ComparePane);