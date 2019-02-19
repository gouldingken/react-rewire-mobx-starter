import React from 'react';
import {observer} from "mobx-react";

export default class ProgramDetail extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, details} = this.props;

        return (
            <div className="ProgramDetail" onClick={() => {
                store.interactionStore.setEditingDetail(details)
            }}>
                <div className={'title'}>{details.title}</div>
                <div className={'count'}>{details.count}</div>
                <div className={'area'}>{Math.round(details.area * 10) / 10}</div>
            </div>
        );
    }
}

observer(ProgramDetail);