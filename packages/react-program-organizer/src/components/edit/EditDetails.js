import React from 'react';
import {observer} from "mobx-react";

export default class EditDetails extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, details} = this.props;
        return (
            <div className="EditDetails">
                <input type="text" value={details.title} onChange={(event) => {
                    details.setTitle(event.target.value)
                }}/>
                <button onClick={() => {
                    store.interactionStore.setEditingDetail(null)
                }}>CLOSE
                </button>
            </div>
        );
    }
}

observer(EditDetails);