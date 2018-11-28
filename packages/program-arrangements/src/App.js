import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ProgramTimelineDataHandler from "./ProgramTimelineDataHandler";
import OptionPicker from "./components/OptionPicker";

class App extends Component {
    render() {
        const {store} = this.props;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ProgramTimelineDataHandler()} store={store} activeOption={store.activeOption}/>
                <OptionPicker store={store} activeOption={store.activeOption}/>
            </div>
        );
    }
}
observer(App);
export default App;
