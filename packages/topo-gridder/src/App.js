import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ADataHandler, ThreeContainer} from "colorizer-three";
import ThreeAppTopoGridder from "./three/ThreeAppTopoGridder";

class App extends Component {
    render() {
        const {store} = this.props;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ADataHandler(store)} useTestCube={true} ThreeAppClass={ThreeAppTopoGridder}/>
            </div>
        );
    }
}

observer(App);
export default App;
