import React from 'react';
import {observer} from "mobx-react";
import Move from "./Move";
import MoveSets from "./MoveSets";

export default class MoveSet extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSet, store} = this.props;

        return (
            <div className="MoveSet">
                {moveSet.date.year} - {moveSet.date.month}
                {moveSet.moves.map((move, i) =>
                    <Move store={store} key={i} move={move} includeMove={MoveSet.includeMove}/>
                )}
                <div>
                    <button onClick={event => this.moveAll()}>Move Set</button>
                </div>
            </div>
        );
    }

    moveAll() {
        const {moveSet, store} = this.props;
        moveSet.moves.forEach((move, i) => {
            MoveSet.includeMove(move, store);
        });
    }

    static includeMove(move, store) {
        for (let i = 1; i <= 7; i++) {//HACK to match subgroups for this move name -- where should this be stored?
            store.includeInList(move.name + '_' + i);
        }
    }
}

observer(MoveSet);