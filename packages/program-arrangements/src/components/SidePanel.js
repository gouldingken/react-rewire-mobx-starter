import React from 'react';
import {observer} from "mobx-react";
import OptionPicker from "./OptionPicker";
import MoveSets from "./MoveSets";

export default class SidePanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store} = this.props;
        return (
            <div className="SidePanel">
                <OptionPicker store={store} activeOption={store.activeOption}/>
                <MoveSets showMoveButtons={store.activeOption !== 'Existing'}
                          activeOption={store.activeOption} store={store} moveSets={store.moveSets}/>
            </div>
        );
    }
}

observer(SidePanel);