import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ProgramTimelineDataHandler from "./ProgramTimelineDataHandler";
import OptionPicker from "./components/OptionPicker";
import {GanttSvg} from "react-timeline-gantt";

class App extends Component {
    render() {
        const {store} = this.props;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ProgramTimelineDataHandler()} store={store}
                                previousOption={store.previousOption} activeOption={store.activeOption}/>
                <GanttSvg interactions={store.timelineInteractionStore}/>
                <OptionPicker store={store} activeOption={store.activeOption}/>

            </div>
        );
    }
}

observer(App);
export default App;
