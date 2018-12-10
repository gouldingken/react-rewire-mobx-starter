import React from 'react';
import {observer} from "mobx-react";
import Move from "./Move";
import MoveSets from "./MoveSets";
import {autorun} from "mobx";
import {If} from "sasaki-core";
import ProgramUtils from "../ProgramUtils";

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
        const {moveSet, store, showMoveButtons} = this.props;

        let title = 'Program';

        if (moveSet.date) {
            title = `${moveSet.date.year} - ${moveSet.date.month}`
        }

        return (
            <div className="MoveSet">
                <div className={'title'}>
                    {title}
                </div>
                {moveSet.moves.map((move, i) =>
                    <Move store={store} key={i} move={move} isMoved={ProgramUtils.isMoved(store, move)}
                          isHighlightedProgram={MoveSet.isHighlighted(store.highlightProgram, move)}
                          includeMove={MoveSet.includeMove} excludeMove={MoveSet.excludeMove}/>
                )}
                <div>
                    <If true={showMoveButtons}>
                        <button className={'move-btn'} onClick={event => this.moveAll()}>Move Phase</button>
                    </If>
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