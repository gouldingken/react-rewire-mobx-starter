import React from 'react';
import {observer} from "mobx-react";
import MoveSet from "./MoveSet";
import {If} from "sasaki-core";
import ProgramUtils from "../ProgramUtils";
import ProgramTimelineDataHandler from "../ProgramTimelineDataHandler";

export default class MoveSets extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSets, store, activeOption, showMoveButtons} = this.props;
        if (!moveSets || moveSets.length === 0) return null;
        let movedSum = ProgramUtils.getMoveSum(store, 'cost');
        let renovation = ProgramUtils.getMoveSum(store, 'asf', (m) => m.properties.type === 'Renovation');
        let newConstruction = ProgramUtils.getMoveSum(store, 'asf', (m) => m.properties.type === 'New Construction');

        return (
            <div className="MoveSets" onMouseLeave={(e) => {
                // console.log('MOUSE LEAVE ' + e.target.className);//
                //bit of a hack to capture mouse leaving the Move element, but also the tag on the right...
                if (e.target.className === 'MoveSets') {
                    //TODO...
                    // store.setHighlightProgram(null)
                }
            }}>
                <div className={'option-title'}>{activeOption}</div>
                <div className={'sum-total'}>{ProgramTimelineDataHandler.getCostRange(movedSum)}</div>
                <div>
                    {moveSets.map((moveSet, i) =>
                        <MoveSet showMoveButtons={showMoveButtons} store={store} key={i} moveSet={moveSet}/>
                    )}
                </div>

                <div>
                    <If true={showMoveButtons}>
                        <div className={'bottom-total'}>Renovation: <strong>{renovation.toLocaleString()}</strong></div>
                        <div className={'bottom-total'}>New Construction: <strong>{newConstruction.toLocaleString()}</strong></div>
                        <button onClick={event => this.moveAll()}>Move All</button>
                    </If>
                </div>
            </div>

        );
    }

    moveAll() {
        const {store} = this.props;
        store.setInclusionList(null);
    }
}

observer(MoveSets);