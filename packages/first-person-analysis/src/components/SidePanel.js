import React from 'react';
import {observer} from "mobx-react";
import CollapsiblePane from "./CollapsiblePane";
import PageStepper from "./PageStepper";
import TargetInfo from "./TargetInfo";

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
                    <button className={'action-btn'} onClick={event => sketchup.getSelectedPaths()}>Import</button>
                </CollapsiblePane>
                <CollapsiblePane store={store} title={'View Targets'} panelId={'targets'}>
                    <TargetInfo store={store} targetId={'target1'}/>
                    <TargetInfo store={store} targetId={'target2'}/>
                    <TargetInfo store={store} targetId={'target3'}/>
                </CollapsiblePane>
                <CollapsiblePane store={store} title={'View Blockers'} panelId={'blockers'}>
                    <button className={'action-btn'}
                            onClick={event => sketchup.getSelectedMesh({mode: 'blocker'})}>Import
                    </button>
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
                        <button className={'action-btn'}>Save</button>
                    </div>
                </CollapsiblePane>
            </div>
        );
    }
}

observer(SidePanel);