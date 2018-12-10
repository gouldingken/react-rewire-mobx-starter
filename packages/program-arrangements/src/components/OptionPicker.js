import React from 'react';
import {observer} from "mobx-react";

export default class OptionPicker extends React.Component {
    constructor(props) {
        super(props);
    }

    setActiveOption(option, e) {
        const {store} = this.props;
        store.setActiveOption(option);
        if (e.ctrlKey) {
            store.setInclusionList(null);
        }

    }

    render() {
        const {activeOption} = this.props;
        return (
            <div className="OptionPicker">
                <div>
                    <button onClick={(e) => {
                        this.setActiveOption('Existing', e);
                    }}>Existing
                    </button>
                    <button onClick={(e) => {
                        this.setActiveOption('Option 1', e);
                    }}>Option 1
                    </button>
                    <button onClick={(e) => {
                        this.setActiveOption('Option 2', e);
                    }}>Option 2
                    </button>
                    <button onClick={(e) => {
                        this.setActiveOption('Option 3', e);
                    }}>Option 3
                    </button>
                    <button onClick={(e) => {
                        this.setActiveOption('Option 4', e);
                    }}>Option 4
                    </button>
                </div>
            </div>
        );
    }
}

observer(OptionPicker);