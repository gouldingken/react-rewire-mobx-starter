import React from 'react';
import {observer} from "mobx-react";
import ProgramBlock from "./ProgramBlock";

export default class ProgramCategory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, category} = this.props;
        return (
            <div className="ProgramCategory">
                <div className={'title'}>{category.title}</div>
                {category.blocks.map((block) =>
                    <ProgramBlock key={block.key} store={store} block={block} sliderValue={block.sliderValue}/>
                )}
            </div>
        );
    }
}

observer(ProgramCategory);