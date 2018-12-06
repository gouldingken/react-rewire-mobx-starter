import React from 'react';
import {observer} from "mobx-react";
import ProgramTimelineDataHandler from "../ProgramTimelineDataHandler";

export default class Move extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {move, store, includeMove, isMoved} = this.props;
        return (
            <div className="Move" style={{background:ProgramTimelineDataHandler.colorProgram(move.name)}} onClick={() => {
                includeMove(move, store);
            }} onMouseOver={() => store.setHighlightProgram(move.name)} onMouseOut={() => store.setHighlightProgram(null)}>
                {move.name} {isMoved ? 'Y' : 'N'}
            </div>
        );
    }
}

observer(Move);