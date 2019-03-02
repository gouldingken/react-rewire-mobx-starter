import React from 'react';

export default class CanvasComponent extends React.Component {

    constructor(props) {
        super(props);
    };

    drawText(text, pos) {
        this.ctx.save();
        this.ctx.font = "12px Open Sans";
        this.ctx.fillStyle = "#b5b5b5";
        this.ctx.textAlign = "right";
        // this.applySettingsToContext(settings, ctx);
        this.ctx.fillText(text, pos.x, pos.y);
        this.ctx.restore();
    }

    drawCircle(circle, strokeColor, fillColor) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(circle.cx, circle.cy, circle.r, 0, 2 * Math.PI);
        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }
        if (strokeColor) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.stroke();
        }
        this.ctx.restore();

    }
}
