import React from 'react';
import {observer} from "mobx-react/index";
import SvgDefs from "./core/SvgDefs";

export default class GanttSvg extends React.Component {

    componentDidMount() {
        const {interactions} = this.props;
        this.boundListeners = {
            mousemove: (e) => {
                const clientRect = this.svg.getBoundingClientRect();
                interactions.setMousePosition({
                    x: e.clientX - clientRect.x,
                    y: e.clientY - clientRect.y
                });
            },
            keydown: (e) => {
                if (e.key === 'e') {
                }
            },
            keyup: (e) => {
                if (e.key === 'e') {
                }
            }
        };
        this.svg.addEventListener('mousemove', this.boundListeners.mousemove);
        window.addEventListener('keydown', this.boundListeners.keydown);
        window.addEventListener('keyup', this.boundListeners.keyup);
    }

    componentWillUnmount() {
        this.svg.removeEventListener('mousemove', this.boundListeners.mousemove);
        window.removeEventListener('keydown', this.boundListeners.keydown);
        window.removeEventListener('keyup', this.boundListeners.keyup);
    }

    render() {
        const {stores} = this.props;
        const height = 800;
        let width = 1200;
        return (
            <svg className={"GanttSvg"} ref={e => this.svg = e} width={width} height={height}>
                <SvgDefs stores={stores}/>
                {/*<rect fill={'#ff0000'} width={100} height={100}/>*/}
            </svg>
        )
    }
}
observer(GanttSvg);