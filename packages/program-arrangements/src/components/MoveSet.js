import React from 'react';
import {observer} from "mobx-react";
import Move from "./Move";

export default class MoveSet extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSet} = this.props;

        return (
            <div className="MoveSet">
                {moveSet.date.year} - {moveSet.date.month}
                {moveSet.moves.map((move, i) =>
                    <Move key={i} move={move}/>
                )}
            </div>
        );
    }
}

observer(MoveSet);