import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ViewsDataHandler from "./ViewsDataHandler";
import ThreeAppFirstPerson from "./three/ThreeAppFirstPerson";
import SidePanel from "./components/SidePanel";

class App extends Component {
    render() {
        const {store} = this.props;

        const sketchup = window.sketchup;
        return (
            <div className="App">
                <ThreeContainer dataHandler={new ViewsDataHandler(store)} useTestCube={true} ThreeAppClass={ThreeAppFirstPerson}/>
                <SidePanel store={store}/>
            </div>
        );
    }
}

observer(App);
export default App;
