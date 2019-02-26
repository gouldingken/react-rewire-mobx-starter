import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ThreeContainer} from "colorizer-three";
import ViewsDataHandler from "./ViewsDataHandler";
import ThreeAppFirstPerson from "./three/ThreeAppFirstPerson";
import SidePanel from "./components/SidePanel";
import OptionsTabs from "./components/OptionsTabs";
import {If} from "sasaki-core";
import ComparePane from "./components/ComparePane";

class App extends Component {
    render() {
        const {store, dataHandler} = this.props;
        //TODO ThreeContainer and ThreeApp instance doesn't currently persist if unmounted and remounted
        //HACK is to use visible property and simply hide the DOM element
        return (
            <div className="App">
                <ThreeContainer dataHandler={dataHandler} useTestCube={true} ThreeAppClass={ThreeAppFirstPerson} visible={store.uiStore.mode !== 'compare'}/>
                <If true={store.uiStore.mode === 'compare'}>
                    <ComparePane store={store}/>
                </If>
                <SidePanel store={store}/>
                <OptionsTabs store={store}/>
            </div>
        );
    }
}

observer(App);
export default App;
