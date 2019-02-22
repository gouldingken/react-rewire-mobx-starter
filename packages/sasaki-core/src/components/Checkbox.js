import React from 'react';
import {observer} from "mobx-react";

export default class Checkbox extends React.Component {
    static defaultProps = {
        isChecked: false,
        label: '',
        onChange: (checked) => {
            console.log('Checked state is now: ' + checked);
        }
    };

    constructor(props) {
        super(props);
        this.isChecked = false;
    }

    render() {
        const {isChecked, label, onChange} = this.props;
        this.isChecked = isChecked;
        return (
            <div className="Checkbox">
                <label>
                    <input type="checkbox"
                           checked={isChecked}
                           onChange={(event) => {
                               this.isChecked = !this.isChecked;
                               onChange(this.isChecked)
                           }}/>
                    <span>{label}</span>
                </label>
            </div>
        );
    }
}

observer(Checkbox);