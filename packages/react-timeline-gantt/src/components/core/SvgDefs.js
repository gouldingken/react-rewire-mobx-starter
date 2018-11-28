import React from 'react';
import {observer} from "mobx-react";

export default class SvgDefs extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <defs>

            </defs>
        );
    }
}
observer(SvgDefs);