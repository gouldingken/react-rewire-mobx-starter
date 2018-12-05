import React from 'react';
import {observer} from "mobx-react";
import MoveSet from "./MoveSet";

export default class MoveSets extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {moveSets} = this.props;
        if (!moveSets || moveSets.length ===  0) return null;
        return (
            <div className="MoveSets">
                {moveSets.map((moveSet, i) =>
                    <MoveSet key={i} moveSet={moveSet}/>
                )}
            </div>
        );
    }
}

observer(MoveSets);