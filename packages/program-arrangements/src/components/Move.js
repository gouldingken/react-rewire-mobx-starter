import React from 'react';
import {observer} from "mobx-react";

export default class Move extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {move} = this.props;
        return (
            <div className="Move">
                {move.name}
            </div>
        );
    }
}

observer(Move);