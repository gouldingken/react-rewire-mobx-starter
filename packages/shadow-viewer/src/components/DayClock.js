import React, {Component} from 'react';
import {observer} from "mobx-react";

export default class DayClock extends Component {
    render() {
        const {store} = this.props;
        if (!store.bitmaskData) {
            return null;
        }
        if (!store.bitmaskData.context || !store.bitmaskData.option1) {
            return null;
        }
        const diff = store.bitmaskData.option1.hrs - store.bitmaskData.context.hrs;
        const x = store.uiStore.selectedPosition.x * 1942;
        const y = store.uiStore.selectedPosition.y * 1000;
        return (
            <div className="DayClock">
                <div>{x}, {y}: {diff}</div>
                {JSON.stringify(store.bitmaskData)}
            </div>
        );
    }
}
observer(DayClock);
