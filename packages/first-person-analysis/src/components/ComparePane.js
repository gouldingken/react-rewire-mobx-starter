import React from 'react';
import {observer} from "mobx-react";
import TargetBars from "./TargetBars";
import LineChart from "./charts/LineChart";

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
                    unobstructed: data.values.sums.unobstructed[targetId] / data.values.count,
                    available: data.values.sums.available[targetId] / data.values.count,
                    unobstructedPoints: data.values.sorted.unobstructed[targetId]
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
            optionDatum.unobstructedPoints.forEach((val, i) => {
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
                                available={optionDatum.available} unobstructed={optionDatum.unobstructed}
                                color={optionDatum.option.chartColor}/>
                )}

                <div
                    style={{
                        width: "400px",
                        height: "300px"
                    }}
                >
                    <LineChart
                        data={chartData}
                    />
                </div>
            </div>
        );
    }
}

observer(ComparePane);