import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class CumulativeChart extends Component {
    render() {
        const {store} = this.props;

        return (
            <div className="CumulativeChart">
                CumulativeChart
            </div>
        );
    }
}
observer(CumulativeChart);
