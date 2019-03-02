import React from 'react';
import {observer} from "mobx-react";
import CanvasComponent from "./CanvasComponent";

export default class LineChart extends CanvasComponent {
    static defaultProps = {
        width: 400,
        height: 300,
        background: '#ffffff'
    };

    constructor(props) {
        super(props);
        this.padding = {top: 2, bottom: 10, left: 10, right: 2};
        this.endLineTick = {size: 7};
    }

    componentDidMount() {
        this.ctx = this.canvas.getContext("2d");
        this.drawData(this.props.data);
    }

    render() {
        const {data, background, width, height} = this.props;

        this.drawData(data);
        return (<canvas ref={(e) => this.canvas = e} style={{background: background}} width={width} height={height}/>);
    }

    drawData(data) {
        if (!data) return;
        if (!this.ctx) return;
        const {width, height, selectedSeriesId} = this.props;
        const size = {w: width, h: height};
        this.ctx.clearRect(0, 0, size.w, size.h);

        this.calcMax(data);

        this.drawYLines(size);
        data.forEach((series, i) => {
            this.drawSeries(series.data, size, series.color, series.id === selectedSeriesId, series.selectedX);
        });
    }

    calcMax(data) {
        this.maxY = 0;
        this.maxX = 0;
        data.forEach((series, i) => {
            series.data.forEach((datum, i) => {
                this.maxY = Math.max(datum[1], this.maxY);
                this.maxX = Math.max(datum[0], this.maxX);
            });
        });
    }

    plotter(size) {
        let maxX = this.maxX;
        let maxY = this.maxY;
        const plotW = size.w - this.padding.left - this.padding.right;
        const plotH = size.h - this.padding.top - this.padding.bottom;
        return (x, y) => {
            return {
                x: this.padding.left + plotW * (x / maxX),
                y: this.padding.top + plotH - plotH * (y / maxY)
            };
        };
    }

    drawSeries(data, size, color, highlight, selectedX) {
        const plot = this.plotter(size);
        this.ctx.save();
        this.ctx.beginPath();
        let pos;
        const circles = [];
        data.forEach((datum, i) => {
            pos = plot(datum[0], datum[1]);
            if (i === 0) {
                this.ctx.moveTo(pos.x, pos.y);
            } else {
                this.ctx.lineTo(pos.x, pos.y);
            }
            if (datum[0] === selectedX) {
                circles.push({cx: pos.x, cy: pos.y, r: (highlight) ? 4 : 2});
            }
        });
        if (this.endLineTick && pos) {
            this.ctx.lineTo(pos.x, pos.y + this.endLineTick.size);
        }
        if (highlight) {
            this.ctx.lineWidth = 3;
        }
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        circles.forEach((circle, i) => {
            this.drawCircle(circle, color, '#ffffff');
        });

        this.ctx.restore();
    }

    drawYLines(size) {
        const plot = this.plotter(size);
        let lineInterval = 250;
        while (this.maxY / lineInterval > 10) {
            lineInterval *= 2
        }
        for (let y = 0; y <= this.maxY; y += lineInterval) {
            this.ctx.beginPath();
            const pos1 = plot(0, y);
            const pos2 = plot(this.maxX, y);
            this.ctx.moveTo(pos1.x, pos1.y);
            this.ctx.lineTo(pos2.x, pos2.y);
            this.ctx.strokeStyle = '#dddddd';
            this.ctx.stroke();

            this.drawText(y.toLocaleString(), {x: pos2.x - 2, y: pos2.y - 4});
        }
    }
}


observer(LineChart);