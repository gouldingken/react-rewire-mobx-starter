import React from 'react';
import {observer} from "mobx-react";
import ProgramDetail from "./ProgramDetail";
// Using an ES6 transpiler like Babel
import Slider from 'react-rangeslider'
// To include the default styles
import 'react-rangeslider/lib/index.css'

export default class ProgramBlock extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     value: 0
        // }
    }

    render() {
        const {store, block, sliderValue} = this.props;
        return (
            <div className="ProgramBlock">
                <div className={'title'}>{block.title}</div>
                <Slider
                    min={0}
                    max={100}
                    value={sliderValue}
                    onChange={(v) => {
                        block.updateSlider(v);
                    }}
                />
                {block.details.map((details) =>
                    <ProgramDetail key={details.key} details={details}/>
                )}
            </div>
        );
    }
}

observer(ProgramBlock);