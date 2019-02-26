import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./CollapsiblePane";
import PageStepper from "./PageStepper";
import TargetInfo from "./TargetInfo";
import {Checkbox} from "sasaki-core";
import {RangeInput} from "sasaki-core";
import {If} from "sasaki-core";
import TargetBars from "./TargetBars";
import ComparePane from "./ComparePane";
import LineChart from "./charts/LineChart";
import Slider from 'react-rangeslider'

export default class SidePanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store} = this.props;
        const {sketchup} = window;

        return (
            <div className="SidePanel">
                <div>
                    <CollapsiblePane store={store} title={'Mode'} panelId={'mode'}>
                        <div>
                            <label><input type="radio" name="mode" checked={store.uiStore.mode === 'analyze'}
                                          onClick={() => store.uiStore.setMode('analyze')}/>Analyze</label>
                        </div>
                        <div>
                            <label><input type="radio" name="mode" checked={store.uiStore.mode === 'review'}
                                          onClick={() => store.uiStore.setMode('review')}/>Review</label>
                        </div>
                        <div>
                            <label><input type="radio" name="mode" checked={store.uiStore.mode === 'compare'}
                                          onClick={() => store.uiStore.setMode('compare')}/>Compare</label>
                        </div>
                    </CollapsiblePane>
                    <CollapsiblePane store={store} title={'Study Points'} panelId={'points'}>
                        <div className={'label'}>Current Point</div>
                        <PageStepper store={store}/>
                        <If true={store.uiStore.mode === 'analyze'}>
                            <button className={'action-btn'}
                                    onClick={event => sketchup.getSelectedPaths()}>Import
                            </button>
                            <button className={'action-btn'}
                                    onClick={event => store.sceneData.clearStudyPoints()}>Clear
                            </button>
                            <div className={'slider-label'}>Spacing: {store.uiStore.pointOptions.spacing}</div>
                            <Slider
                                min={3}
                                max={20}
                                step={1}
                                value={store.uiStore.pointOptions.spacing}
                                onChange={(v) => {
                                    store.uiStore.setPointOptions({spacing: v});
                                }}
                            />
                            <div className={'slider-label'}>Offset: {store.uiStore.pointOptions.offset}</div>
                            <Slider
                                min={0.1}
                                max={2}
                                step={0.1}
                                value={store.uiStore.pointOptions.offset}
                                onChange={(v) => {
                                    const nearest = Math.round(v * 10) / 10;//prevent floating point weirdness
                                    store.uiStore.setPointOptions({offset: nearest});
                                }}
                            />
                            <button className={'action-btn'}
                                    onClick={event => store.sceneData.updatePoints()}>Update Points
                            </button>
                        </If>
                    </CollapsiblePane>
                    <CollapsiblePane store={store} title={'View Targets'} panelId={'targets'}>
                        <TargetInfo store={store} targetId={'target1'}/>
                        <TargetInfo store={store} targetId={'target2'}/>
                        <TargetInfo store={store} targetId={'target3'}/>
                        <If true={store.uiStore.mode === 'analyze'}>
                            <button className={'action-btn'}
                                    onClick={event => store.uiStore.setTargetChartMax(store.targetStore.maxVisibleValue)}>Set
                                Max
                            </button>
                        </If>
                    </CollapsiblePane>
                    <If true={store.uiStore.mode === 'review'}>
                        <CollapsiblePane store={store} title={'Charts'} panelId={'charts'}>
                            <ReviewChart store={store} width={270}/>
                        </CollapsiblePane>
                    </If>
                    <CollapsiblePane store={store} title={'View Blockers'} panelId={'blockers'}>
                        <If true={store.uiStore.mode === 'analyze'}>
                            <button className={'action-btn'}
                                    onClick={event => sketchup.getSelectedMesh({mode: 'blocker'})}>Import
                            </button>
                            <button className={'action-btn'}
                                    onClick={event => store.sceneData.clearViewBlockers()}>Clear
                            </button>
                        </If>
                        <Checkbox label={'Show'} isChecked={store.uiStore.blockersVisible}
                                  onChange={(checked) => store.uiStore.setBlockersVisible(checked)}/>
                    </CollapsiblePane>
                    <CollapsiblePane store={store} title={'Analysis'} panelId={'analysis'}>
                        <div>
                            <If true={store.optionsStore.selectedOptions.length > 1}>
                                Multiple Options Selected
                            </If>
                            <If true={store.optionsStore.selectedOptions.length === 1}>
                                <div>
                                    {store.optionsStore.getOption(store.optionsStore.selectedOptions[0]).name}:
                                    {store.readingsStore.readingsCount} result generated out
                                    of {store.uiStore.studyPoints.count}
                                </div>
                                <button className={'action-btn'}
                                        onClick={event => store.uiStore.setIsPlaying(true)}>Run
                                </button>
                                <button className={'action-btn'}
                                        onClick={event => store.uiStore.setIsPlaying(false)}>Pause
                                </button>
                                <button className={'action-btn'} onClick={event => {
                                    store.uiStore.setCurrentStudyPoint(0);
                                    store.uiStore.setIsPlaying(false)
                                }}>Reset
                                </button>
                            </If>
                        </div>
                        <div>
                            <button className={'action-btn'}
                                    onClick={event => sketchup.saveTextToFile({
                                        title: 'Save analysis points',
                                        ext: 'json',
                                        data: JSON.stringify(store.readingsStore.readings)
                                    })}>Save
                            </button>
                        </div>
                    </CollapsiblePane>
                </div>
            </div>
        );
    }
}

class ReviewChart extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, width} = this.props;

        const allReadings = store.readingsStore.summarizeReadings();

        const optionData = ComparePane.getOptionData(allReadings, store.uiStore.selectedReviewTarget, store.optionsStore);

        let selectedOption = null;
        if (store.optionsStore.selectedOptions.length === 1) {
            selectedOption = store.optionsStore.selectedOptions[0];
        }
        let selectedMetaData = [];
        let structuredChartData = ComparePane.structureChartData(optionData, store.uiStore.studyPoints.current);
        let selectedIndex = -1;
        structuredChartData.forEach((series, i) => {
            if (selectedOption !== series.id) return;
            selectedMetaData = series.metaData;
            selectedIndex = series.selectedX;
        });


        const shift = (e, amt) => {
            if (selectedMetaData.length === 0) return;
            let n = amt;
            if (e.ctrlKey) {
                n *= 10;
            }
            if (e.shiftKey) {
                n *= 10;
            }
            selectedIndex += n;
            selectedIndex = Math.max(0, Math.min(selectedIndex, selectedMetaData.length - 1));
            store.uiStore.setCurrentStudyPoint(selectedMetaData[selectedIndex].idx);
        };

        return (
            <div className={'compare-group'}>
                <div style={{width: width, height: "300px"}}>
                    <LineChart
                        width={width}
                        background={'#ffffff'}
                        selectedSeriesId={selectedOption}
                        data={structuredChartData}
                    />
                </div>
                <button className={'action-btn'}
                        onClick={e => shift(e,-1)}>Up
                </button>
                <button className={'action-btn'}
                        onClick={e => shift(e,1)}>Down
                </button>
            </div>
        );
    }
}

observer(ReviewChart);
observer(SidePanel);