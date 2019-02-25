import React from 'react';
import {observer} from "mobx-react";
import ProgramDetail from "react-program-organizer/src/components/ProgramBlock";

export default class OptionsTabs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store} = this.props;
        return (
            <div className="OptionsTabs">
                {store.optionsStore.options.map((option) =>
                    <OptionTab key={option.key} store={store} option={option}/>
                )}
                <NewTabButton store={store}/>
            </div>
        );
    }
}

class OptionTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, option} = this.props;
        let className = 'OptionTab';
        if (option.selected) {
            className += ' selected';
        }
        return (
            <div className={className} onClick={(e) => {
                store.optionsStore.selectOption(option.key, e.ctrlKey);
            }}>
                {option.name}
            </div>
        );
    }
}

class NewTabButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, option} = this.props;
        return (
            <div className="NewTabButton" onClick={() => {
                store.optionsStore.addOption();
            }}>
                +
            </div>
        );
    }
}

observer(OptionsTabs);
observer(OptionTab);
observer(NewTabButton);