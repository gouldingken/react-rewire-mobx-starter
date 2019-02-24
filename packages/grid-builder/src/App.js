import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ADataHandler, ThreeContainer} from "colorizer-three";
import ThreeAppGridBuilder from "./three/ThreeAppGridBuilder";

class App extends Component {
    render() {
        const {store} = this.props;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ADataHandler(store)} useTestCube={false} ThreeAppClass={ThreeAppGridBuilder}/>
            </div>
        );
    }
}

observer(App);
export default App;
