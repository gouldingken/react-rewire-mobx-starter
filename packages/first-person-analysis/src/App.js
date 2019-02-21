import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ViewsDataHandler from "./ViewsDataHandler";
import ThreeAppFirstPerson from "./three/ThreeAppFirstPerson";

class App extends Component {
    render() {
        const {store} = this.props;

        const sketchup = window.sketchup;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ViewsDataHandler()} useTestCube={true} ThreeAppClass={ThreeAppFirstPerson}/>
                <div className={'button-holder'}>
                    <button onClick={()=> {
                        sketchup.getSelectedMesh();
                    }}>GET SELECTED</button>
                    <button onClick={()=> {
                        sketchup.getSelectedPaths();
                    }}>IMPORT FLOOR PLATES</button>
                </div>
            </div>
        );
    }
}

observer(App);
export default App;
