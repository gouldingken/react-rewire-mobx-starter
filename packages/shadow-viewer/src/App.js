import React, {Component} from 'react';
import {observer} from "mobx-react";
import ShadowComposite from "./components/ShadowComposite";
import ShadowAnimation from "./components/ShadowAnimation";
import PositionSelector from "./components/PositionSelector";
import DayClock from "./components/DayClock";

class App extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const {store} = this.props;
        const {uiStore} = store;

        return (
            <div className="App">
                <div>
                    <DayClock store={store}/>
                </div>
                <PositionSelector store={store}>
                    <ShadowComposite store={store}/>
                </PositionSelector>
                <PositionSelector store={store}>
                    <ShadowAnimation minute={uiStore.selectedMinute} store={store}/>
                </PositionSelector>
                <div>
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
            </div>
        );
    }
}

observer(App);
export default App;