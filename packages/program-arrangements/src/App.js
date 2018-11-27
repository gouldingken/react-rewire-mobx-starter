import React, {Component} from 'react';
import {ThreeContainer} from "colorizer-three";
import ProgramTimelineDataHandler from "./ProgramTimelineDataHandler";

class App extends Component {
    render() {
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ProgramTimelineDataHandler()}/>
            </div>
        );
    }
}

export default App;
