import React from 'react';
import {observer} from "mobx-react";
import MoveSet from "./MoveSet";
import {If} from "sasaki-core";
import ProgramUtils from "../ProgramUtils";

export default class MoveSets extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSets, store, activeOption, showMoveButtons} = this.props;
        if (!moveSets || moveSets.length === 0) return null;
        let movedSum = ProgramUtils.getMoveSum(store);

        return (
            <div className="MoveSets">
                <div className={'option-title'}>{activeOption}</div>
                <div className={'sum-total'}>{ProgramUtils.formatCost(movedSum)}</div>
                <div>
                    {moveSets.map((moveSet, i) =>
                        <MoveSet showMoveButtons={showMoveButtons} store={store} key={i} moveSet={moveSet}/>
                    )}
                </div>
                <div>
                    <If true={showMoveButtons}>
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