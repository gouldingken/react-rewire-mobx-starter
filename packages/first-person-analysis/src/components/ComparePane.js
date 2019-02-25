import React from 'react';
import {observer} from "mobx-react";
import TargetBars from "./TargetBars";
import LineChart from "./charts/LineChart";

export default class ComparePane extends React.Component {
    constructor(props) {
        super(props);
    }

    static getOptionData(allReadings, targetId, optionsStore) {
        return allReadings.map((data, i) => {
            const option = optionsStore.getOption(data.option);
            return {
                option: option,
                unobstructed: data.values.sums.unobstructed[targetId] / data.values.count,
                available: data.values.sums.available[targetId] / data.values.count,
                unobstructedPoints: data.values.sorted.unobstructed[targetId]
            };
        });
    }

    static structureChartData(optionData, selectedIndex) {
        const chartData = [];
        optionData.forEach((optionDatum, i) => {
            const chartXYs = [];
            let selectedX = -1;
            optionDatum.unobstructedPoints.forEach((p, i) => {
                if (selectedIndex != null && p.i === selectedIndex) {
                    selectedX = i;
                }
                chartXYs.push([i, p.v]);
            });
            let option = optionDatum.option;
            chartData.push({label: option.name, id:option.key, color: option.chartColor, data: chartXYs, selectedX:selectedX});
        });
        return chartData;
    }

    render() {
        const {store} = this.props;
        const viewTarget1 = store.targetStore.getViewTarget('target1');
        const viewTarget2 = store.targetStore.getViewTarget('target2');
        const viewTarget3 = store.targetStore.getViewTarget('target3');

        const allReadings = store.readingsStore.summarizeReadings();

        const getOptionData = (targetId) => {
            return ComparePane.getOptionData(allReadings, targetId, store.optionsStore)
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
                        data={ComparePane.structureChartData(optionData)}
                    />
                </div>
            </div>
        );
    }
}

observer(ComparePane);