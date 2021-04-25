import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class PositionSelector extends Component {
    render() {
        const {store} = this.props;

        return (
            <div className="PositionSelector">
                PositionSelector
            </div>
        );
    }
}
observer(PositionSelector);
