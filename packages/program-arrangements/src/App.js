import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ProgramTimelineDataHandler from "./ProgramTimelineDataHandler";
import OptionPicker from "./components/OptionPicker";
import {GanttSvg} from "react-timeline-gantt";
import MoveSets from "./components/MoveSets";

class App extends Component {
    render() {
        const {store} = this.props;
        return (
            <div className="App">
                <ThreeContainer useShadows={true} dataHandler={new ProgramTimelineDataHandler()} store={store}
                                previousOption={store.previousOption} activeOption={store.activeOption} inclusionList={store.inclusionList}/>
                {/*<GanttSvg interactions={store.timelineInteractionStore}/>*/}
                <OptionPicker store={store} activeOption={store.activeOption}/>
                <MoveSets store={store} moveSets={store.moveSets}/>

            </div>
        );
    }
}

observer(App);
export default App;
