import React from 'react';
import {observer} from "mobx-react";

export default class TextInput extends React.Component {
    static defaultProps = {
        text: '',
        onChange: (text) => {
            console.log('TextInput text is now: ' + text);
        }
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {text, onChange} = this.props;

        return (
            <div className="TextInput">
                <input type="text"
                       value={text}
                       onChange={(event) => {
                           onChange(event.target.value)
                       }}/>
            </div>
        );
    }
}

observer(TextInput);