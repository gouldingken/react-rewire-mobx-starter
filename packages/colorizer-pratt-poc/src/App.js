import React, {Component} from 'react';
import {ThreeContainer} from "colorizer-three";
import PrattDataHandler from "./PrattDataHandler";

class App extends Component {
    render() {
        return (
            <div className="App">
                <ThreeContainer dataHandler={new PrattDataHandler()}/>
            </div>
        );
    }
}

export default App;
