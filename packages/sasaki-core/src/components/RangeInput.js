import React from 'react';
import {observer} from "mobx-react";

export default class RangeInput extends React.Component {
    static defaultProps = {
        min: 0,
        max: 100,
        value: 50,
        step: 1,
        label: '',
        onChange: (value) => {
            console.log('Input state is now: ' + value);
        },
        onInput: (checked) => {
            console.log('Input state is now: ' + checked);
        }
    };

    constructor(props) {
        super(props);
        this.state = {value: this.props.value};
    }

    render() {
        const {min, max, step, label, onChange, onInput} = this.props;
        return (
            <div className="RangeInput">
                <label><input type="range" min={min} max={max} value={this.state.value} step={step} onChange={(e) => {
                    this.setState({value: e.target.value});
                    onChange(this.state.value);
                }}/>{label}: {this.state.value}</label>
            </div>
        );
    }
}

observer(RangeInput);