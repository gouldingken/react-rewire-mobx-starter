import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class DayClock extends Component {
    render() {
        const {store} = this.props;

        return (
            <div className="DayClock">
                DayClock
            </div>
        );
    }
}
observer(DayClock);
