import React from 'react';
import {observer} from "mobx-react";

export default class Move extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {move, store, includeMove, isMoved} = this.props;
        return (
            <div className="Move" onClick={() => {
                includeMove(move, store);
            }}>
                {move.name} {isMoved ? 'Y' : 'N'}
            </div>
        );
    }
}

observer(Move);