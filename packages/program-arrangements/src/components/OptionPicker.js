import React from 'react';
import {observer} from "mobx-react";

export default class OptionPicker extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, activeOption} = this.props;
        return (
            <div className="OptionPicker">
                <div>{activeOption}</div>
                <button onClick={() => {
                    store.setActiveOption('Option 1');
                }}>Option 1
                </button>
                <button onClick={() => {
                    store.setActiveOption('Option 2');
                }}>Option 2
                </button>
            </div>
        );
    }
}

observer(OptionPicker);