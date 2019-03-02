import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ViewsDataHandler from "./ViewsDataHandler";
import ThreeAppFirstPerson from "./three/ThreeAppFirstPerson";
import SidePanel from "./components/SidePanel";
import OptionsTabs from "./components/OptionsTabs";
import {If} from "sasaki-core";
import ComparePane from "./components/ComparePane";
import {WebGL} from "colorizer-three";
import ThreeOverlay from "./components/ThreeOverlay";

class App extends Component {
    render() {
        const {store, dataHandler} = this.props;
        //TODO ThreeContainer and ThreeApp instance doesn't currently persist if unmounted and remounted
        //HACK is to use visible property and simply hide the DOM element
        if (!WebGL.detectWebGLContext()) {
            return (<SketchUpBugMessage/>);
        }
        return (
            <div className="App">
                <ThreeContainer dataHandler={dataHandler} useTestCube={true} ThreeAppClass={ThreeAppFirstPerson}
                                visible={store.uiStore.mode !== 'compare'}/>
                <If true={store.uiStore.mode !== 'compare'}>
                    <ThreeOverlay store={store}/>
                </If>
                <If true={store.uiStore.mode === 'compare'}>
                    <ComparePane store={store}/>
                </If>
                <SidePanel store={store} dataHandler={dataHandler}/>
                <OptionsTabs store={store}/>
            </div>
        );
    }
}

class SketchUpBugMessage extends Component {
    render() {
        return <div className="SketchUpBugMessage">
            <div className={'message'}>
                <h2>Web GL Cannot Start</h2>
                <h3>SketchUp Bug</h3>
                <p>If you're seeing this when using a laptop with a USB dock, then this is a known bug. When SketchUp starts in
                    docked mode it uses the wrong settings for web-based dialogs. Web GL cannot be started with these settings.</p>
                <h3>Workaround</h3>
                <p>
                    <ul>
                        <li>Undock Laptop</li>
                        <li>Close Sketchup</li>
                        <li>Open Sketchup</li>
                    </ul>
                </p>
                <h3>Notes</h3>
                <p>It does not matter when you show the dialog (you can close/open the dialog while docked)</p>
                <p>Using File > Open does not start a new SketchUp process</p>
                <p>If you open a new file by clicking on a SketchUp file in Explorer, you should undock first</p>
            </div>
        </div>;
    }
}

observer(App);
export default App;
