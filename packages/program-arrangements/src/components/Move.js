import React from 'react';
import {observer} from "mobx-react";
import ProgramTimelineDataHandler from "../ProgramTimelineDataHandler";
import ProgramUtils from "../ProgramUtils";

export default class Move extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {move, store, includeMove, excludeMove, isMoved, isHighlightedProgram} = this.props;
        let asf = move.properties.asf;
        if (asf > 0) {
            asf = asf.toLocaleString();
        } else {
            asf = '-';
        }
        return (
            <div className="Move" style={{background: ProgramTimelineDataHandler.colorProgram(move.name)}}
                 onClick={() => {
                     if (isMoved) {
                         excludeMove(move, store);
                     } else {
                         includeMove(move, store);
                     }
                 }}
                 onMouseOver={() => store.setHighlightProgram(move.moveIds)}
                 onMouseOut={() => {
                     console.log('MOUSE OUT');
                     store.setHighlightProgram(null)
                 }} onMouseLeave={() => {
                console.log('MOUSE LEAVE');
                // store.setHighlightProgram(null)
            }}>
                <div className={'title' + ((isHighlightedProgram) ? ' highlight' : '')}>{move.name}</div>
                <div className={'asf-label'}>
                    {asf}
                </div>
                <div className={'cost-label'}>
                    {ProgramUtils.formatCost(move.properties.cost)}
                </div>
                <div className={'move-tag' + ((isMoved) ? ' moved' : '')}>
                    {isMoved ? store.activeOption : store.previousOption}
                </div>
            </div>
        );
    }
}

observer(Move);