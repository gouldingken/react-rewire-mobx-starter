import React from 'react';
import {observer} from "mobx-react";
import MoveSet from "./MoveSet";

export default class MoveSets extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSets, store} = this.props;
        if (!moveSets || moveSets.length ===  0) return null;
        return (
            <div className="MoveSets">
                <div>
                {moveSets.map((moveSet, i) =>
                    <MoveSet store={store} key={i} moveSet={moveSet}/>
                )}
                </div>
                <div>
                    <button onClick={event => this.moveAll()}>Move ALL</button>
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