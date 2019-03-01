import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./CollapsiblePane";
import PageStepper from "./PageStepper";
import TargetInfo from "./TargetInfo";
import {Checkbox, TextInput} from "sasaki-core";
import {RangeInput} from "sasaki-core";
import {If} from "sasaki-core";
import TargetBars from "./TargetBars";
import ComparePane from "./ComparePane";
import LineChart from "./charts/LineChart";
import Slider from 'react-rangeslider'
import ProgressBar from "./ProgressBar";

export default class SidePanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, dataHandler} = this.props;
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
                        {/*<button className={'action-btn'}*/}
                        {/*onClick={event => sketchup.getActiveView()}>Get View*/}
                        {/*</button>*/}
                    </CollapsiblePane>
                    <CollapsiblePane store={store} title={'Option'} panelId={'option'} initCollapsed={true}>
                        <If true={store.optionsStore.selectedOptions.length > 1}>
                            Multiple Options Selected
                        </If>
                        <If true={store.optionsStore.selectedOptions.length === 1}>
                            <TextInput text={store.optionsStore.getOption(store.optionsStore.selectedOptions[0]).name}
                                       onChange={(text) => {
                                           store.optionsStore.updateOption(store.optionsStore.selectedOptions[0], {name: text});
                                       }}/>
                            <button className={'action-btn'}
                                    onClick={event => store.sceneData.deleteActiveOption()}>Delete Option
                            </button>
                        </If>
                    </CollapsiblePane>
                    <CollapsiblePane store={store} title={'Study Points'} panelId={'points'}>
                        <div className={'label'}>Current Point</div>
                        <PageStepper store={store}/>
                        <button className={'action-btn'}
                                onClick={event => store.sceneData.centerView()}>Center View
                        </button>
                        <If true={store.uiStore.mode === 'analyze'}>
                            <CollapsiblePane backgroundColor={'#666666'} store={store} title={'Outlines'}
                                             panelId={'points-outlines'} initCollapsed={true}>
                                <button className={'action-btn'}
                                        onClick={event => sketchup.getSelectedPaths()}>Import Paths
                                </button>
                                <button className={'action-btn'}
                                        onClick={event => store.sceneData.clearStudyPoints()}>Clear Paths
                                </button>
                                <div className={'slider-label'}>Spacing: {store.uiStore.pointOptions.spacing}</div>
                                <Slider min={3} max={30} step={1} value={store.uiStore.pointOptions.spacing}
                                        onChange={(v) => {
                                            store.uiStore.setPointOptions({spacing: v});
                                        }}
                                />
                                <div className={'slider-label'}>Offset: {store.uiStore.pointOptions.offset}</div>
                                <Slider min={0.1} max={2} step={0.1} value={store.uiStore.pointOptions.offset}
                                        onChange={(v) => {
                                            const nearest = Math.round(v * 10) / 10;//prevent floating point weirdness
                                            store.uiStore.setPointOptions({offset: nearest});
                                        }}
                                />
                                <div className={'slider-label'}>Height: {store.uiStore.pointOptions.height}</div>
                                <Slider min={0} max={10} step={0.5} value={store.uiStore.pointOptions.height}
                                        onChange={(v) => {
                                            const nearest = Math.round(v * 2) / 2;//prevent floating point weirdness
                                            store.uiStore.setPointOptions({height: nearest});
                                        }}
                                />
                            </CollapsiblePane>
                            <CollapsiblePane backgroundColor={'#666666'} store={store} title={'Surface'}
                                             panelId={'points-surface'} initCollapsed={true}>
                                <button className={'action-btn'}
                                        onClick={event => sketchup.getSelectedMesh({mode: 'mesh-points'})}>Import
                                    Surfaces
                                </button>
                                <button className={'action-btn'}
                                        onClick={event => store.sceneData.clearStudyPoints()}>Clear Surfaces
                                </button>
                                <div className={'slider-label'}>Density: {store.uiStore.surfaceOptions.density}</div>
                                <Slider min={5} max={250} step={5} value={store.uiStore.surfaceOptions.density}
                                        onChange={(v) => {
                                            const nearest = Math.round(v);
                                            store.uiStore.setSurfaceOptions({density: nearest});
                                        }}
                                />
                                <div className={'slider-label'}>Height: {store.uiStore.surfaceOptions.height}</div>
                                <Slider min={0} max={10} step={0.5} value={store.uiStore.surfaceOptions.height}
                                        onChange={(v) => {
                                            const nearest = Math.round(v * 2) / 2;//prevent floating point weirdness
                                            store.uiStore.setSurfaceOptions({height: nearest});
                                        }}
                                />
                            </CollapsiblePane>
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
                            <ReviewChart dataHandler={dataHandler} store={store} width={270}/>
                        </CollapsiblePane>
                        <CollapsiblePane store={store} title={'Color Ramp'} panelId={'color-ramp'}>
                            <div className={'slider-label'}>Intensity: {store.uiStore.valueRampMultiplier}</div>
                            <Slider min={0.1} max={4} step={0.1} value={store.uiStore.valueRampMultiplier}
                                    onChange={(v) => {
                                        const nearest = Math.round(v * 10) / 10;//prevent floating point weirdness
                                        store.uiStore.setValueRampMultiplier(nearest);
                                    }}
                            />
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
                                <div>{store.optionsStore.getOption(store.optionsStore.selectedOptions[0]).name}</div>
                                <div>
                                    {store.readingsStore.readingsCount} result{(store.readingsStore.readingsCount !== 1) ? 's' : ''} generated
                                    out
                                    of {store.uiStore.studyPoints.count}
                                </div>
                                <If true={store.uiStore.mode === 'analyze'}>
                                    <ProgressBar color={'#666666'} fullWidth={200}
                                                 total={store.uiStore.studyPoints.count}
                                                 progress={store.readingsStore.readingsCount}/>
                                    <div style={{marginTop: 8}}>
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
                                    </div>
                                </If>
                            </If>
                        </div>
                        <div>
                            <button className={'action-btn'}
                                    onClick={event => dataHandler.saveScene()}>Save
                            </button>
                            <button className={'action-btn'}
                                    onClick={event => dataHandler.loadScene('./data/viewPoints.gltf')}>Load
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
        const {store, width, dataHandler} = this.props;

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
                n *= 50;
            }
            selectedIndex += n;
            selectedIndex = Math.max(0, Math.min(selectedIndex, selectedMetaData.length - 1));
            let pointPos = selectedMetaData[selectedIndex].idx;
            store.uiStore.setLastPickedPoint(dataHandler.getStudyPoint(pointPos));//treat like a user click so it persists
            store.uiStore.setCurrentStudyPoint(pointPos);
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
                        onClick={(e) => shift(e, -1)}>Up
                </button>
                <button className={'action-btn'}
                        onClick={(e) => shift(e, 1)}>Down
                </button>
            </div>
        );
    }
}

observer(ReviewChart);
observer(SidePanel);