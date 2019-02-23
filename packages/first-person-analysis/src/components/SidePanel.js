import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./CollapsiblePane";
import PageStepper from "./PageStepper";
import TargetInfo from "./TargetInfo";
import {Checkbox} from "sasaki-core";
import {RangeInput} from "sasaki-core";

export default class SidePanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store} = this.props;
        const sketchup = window.sketchup;

        return (
            <div className="SidePanel">
                <CollapsiblePane store={store} title={'Study Points'} panelId={'points'}>
                    <div className={'label'}>Current Point</div>
                    <PageStepper store={store}/>
                    <button className={'action-btn'}
                            onClick={event => sketchup.getSelectedPaths()}>Import
                    </button>
                    <button className={'action-btn'}
                            onClick={event => store.sceneData.clearStudyPoints()}>Clear
                    </button>
                    <RangeInput label={'Spacing'} min={3} max={20} step={1} value={store.uiStore.pointOptions.spacing}
                                onChange={(value) => {
                                    store.uiStore.setPointOptions({spacing: value});
                                }}/>
                    <RangeInput label={'Offset'} min={0.1} max={2} step={0.1} value={store.uiStore.pointOptions.offset}
                                onChange={(value) => {
                                    store.uiStore.setPointOptions({offset: value});
                                }}/>
                    <button className={'action-btn'}
                            onClick={event => store.sceneData.updatePoints()}>Update Points
                    </button>
                </CollapsiblePane>
                <CollapsiblePane store={store} title={'View Targets'} panelId={'targets'}>
                    <TargetInfo store={store} targetId={'target1'}/>
                    <TargetInfo store={store} targetId={'target2'}/>
                    <TargetInfo store={store} targetId={'target3'}/>
                    <button className={'action-btn'}
                            onClick={event => store.uiStore.setTargetChartMax(store.targetStore.maxVisibleValue)}>Set
                        Max
                    </button>
                </CollapsiblePane>
                <CollapsiblePane store={store} title={'View Blockers'} panelId={'blockers'}>
                    <button className={'action-btn'}
                            onClick={event => sketchup.getSelectedMesh({mode: 'blocker'})}>Import
                    </button>
                    <button className={'action-btn'}
                            onClick={event => store.sceneData.clearViewBlockers()}>Clear
                    </button>
                    <Checkbox label={'Show'} isChecked={store.uiStore.blockersVisible}
                              onChange={(checked) => store.uiStore.setBlockersVisible(checked)}/>
                </CollapsiblePane>
                <CollapsiblePane store={store} title={'Analysis'} panelId={'analysis'}>
                    <button className={'action-btn'} onClick={event => store.uiStore.setIsPlaying(true)}>Run</button>
                    <button className={'action-btn'} onClick={event => store.uiStore.setIsPlaying(false)}>Pause</button>
                    <button className={'action-btn'} onClick={event => {
                        store.uiStore.setCurrentStudyPoint(0);
                        store.uiStore.setIsPlaying(false)
                    }}>Reset
                    </button>
                    <div>
                        {store.readingsStore.readingsCount} result generated out of {store.uiStore.studyPoints.count}
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
        );
    }
}

observer(SidePanel);