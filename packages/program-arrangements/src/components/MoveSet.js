import React from 'react';
import {observer} from "mobx-react";
import Move from "./Move";
import MoveSets from "./MoveSets";
import {autorun} from "mobx";

export default class MoveSet extends React.Component {
    constructor(props) {
        super(props);
        const {store} = this.props;
        // autorun(() => {
        //     console.log("inclusionList: ", store.inclusionList.join(", "));
        //     // this.forceUpdate();
        // });

    }

    render() {
        const {moveSet, store} = this.props;

        let isMoved = (move) => {
            return !store.inclusionList || store.inclusionList.indexOf(move.name + '_1') >= 0;
        };

        return (
            <div className="MoveSet">
                <div className={'title'}>
                    {moveSet.date.year} - {moveSet.date.month}
                </div>
                {moveSet.moves.map((move, i) =>
                    <Move store={store} key={i} move={move} isMoved={isMoved(move)}
                          isHighlightedProgram={MoveSet.isHighlighted(store.highlightProgram, move)}
                          includeMove={MoveSet.includeMove} excludeMove={MoveSet.excludeMove}/>
                )}
                <div>
                    <button className={'move-btn'} onClick={event => this.moveAll()}>Move Phase</button>
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
        move.moveIds.forEach((moveId, i) => {
            store.includeInList(moveId);
        });
    }

    static excludeMove(move, store) {
        move.moveIds.forEach((moveId, i) => {
            store.includeInList(moveId);
        });
    }

    static isHighlighted(highlightProgram, move) {
        if (!highlightProgram) return false;
        return move.moveIds.some(function (moveId, i) {
            return highlightProgram.indexOf(moveId) >= 0;
        });
    }
}

observer(MoveSet);