import React from 'react';
import {observer} from "mobx-react";
import ProgramTimelineDataHandler from "../ProgramTimelineDataHandler";

export default class Move extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {move, store, includeMove, excludeMove, isMoved} = this.props;
        console.log('MOVE component render');
        return (
            <div className="Move" style={{background:ProgramTimelineDataHandler.colorProgram(move.name)}} onClick={() => {
                if (isMoved) {
                    excludeMove(move, store);
                } else {
                    includeMove(move, store);
                }
            }} onMouseOver={() => store.setHighlightProgram(move.name)} onMouseOut={() => {
                console.log('MOUSE OUT');
                store.setHighlightProgram(null)
            }} onMouseLeave={() => {
                console.log('MOUSE LEAVE');
                // store.setHighlightProgram(null)
            }}>
                {move.name} {isMoved ? 'Y' : 'N'}
            </div>
        );
    }
}

observer(Move);