import React from 'react';
import {observer} from "mobx-react";
import ProgramTimelineDataHandler from "../ProgramTimelineDataHandler";
import ProgramUtils from "../ProgramUtils";
import {If} from "sasaki-core";

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
        //TODO replace ASF with existing ASF if not moved yet...
        return (
            <div className="Move" style={{background: ProgramTimelineDataHandler.colorProgram(move.name, true)}}
                 onClick={() => {
                     if (isMoved) {
                         excludeMove(move, store);
                     } else {
                         includeMove(move, store);
                     }
                 }}
                 onMouseOver={() => store.setHighlightProgram(move.moveIds)}
                 onMouseOut={(e) => {
                     // console.log('MOUSE OUT ' + e.target.className);
                     if (e.target.className === 'Move') {//prevent actions on sub-element mouse out events
                         // store.setHighlightProgram(null)
                     }
                 }}
                 onMouseLeave={(e) => {
                     console.log('MOUSE LEAVE ' + e.target.className);//
                     //bit of a hack to capture mouse leaving the Move element, but also the tag on the right...
                     if (e.target.className.indexOf('move-tag') === 0 || e.target.className === 'Move') {
                         store.setHighlightProgram(null)
                     }
                 }}>
                <div className={'title' + ((isHighlightedProgram) ? ' highlight' : '')}>{move.name}</div>
                <div className={'asf-label'}>
                    {asf}
                </div>
                <div className={'cost-label'}>
                    {ProgramTimelineDataHandler.getCostRange(move.properties.cost)}
                </div>
                <If true={store.activeOption !== 'Existing'}>
                    <div className={'move-tag' + ((isMoved) ? ' moved' : '')}>
                        {isMoved ? store.activeOption : store.previousOption}
                    </div>
                </If>
            </div>
        );
    }
}

observer(Move);