import React, {Component} from 'react';
import {observer} from "mobx-react";
import ShadowComposite from "./components/ShadowComposite";
import ShadowAnimation from "./components/ShadowAnimation";

class App extends Component {
    constructor(props) {
        super(props);

    }
    render() {
        const {store} = this.props;
        const {uiStore} = store;

        return (
            <div className="App">
                Shadow Viewer
                <ShadowComposite/>
                <ShadowAnimation minute={uiStore.selectedMinute}/>
                <button onClick={() => {
                    uiStore.setSelectedMinute(uiStore.selectedMinute + 3)
                }}>MIN +
                </button>
                <button onClick={() => {
                    uiStore.setSelectedMinute(uiStore.selectedMinute - 3)
                }}>MIN -
                </button>
                <span>{uiStore.selectedMinute}</span>
            </div>
        );
    }
}

observer(App);
export default App;
