import * as d3 from 'd3';
import './Tooltip.scss';
import {Utils} from "./../../Utils";
import {Component} from "./../../Interfaces/Component";
import { ChartComponentData } from '../../Models/ChartComponentData';

class Tooltip extends Component {

    public renderTarget;
    private tooltipDiv;
    private tooltipDivInner;
    private tooltipText;
    public draw;
    private borderColor;

	constructor(renderTarget) {
        super(renderTarget);
    }

    public hide () {
        if (this.tooltipDiv) {
            this.tooltipDiv.style("display", "none");
        }
    }

    private getSVGWidth () {
        return !this.renderTarget.select('.tsi-chartSVG').empty() ? this.renderTarget.select('.tsi-chartSVG').node().getBoundingClientRect().width : 0;
    }

    private getSVGHeight () {
        return !this.renderTarget.select('.tsi-chartSVG').empty() ? this.renderTarget.select('.tsi-chartSVG').node().getBoundingClientRect().height : 0;
    }

    private getLeftOffset (chartMargins) {
        //NOTE - this assumes that the svg's right border is the same as the render target's
        var renderTargetWidth = this.renderTarget.node().getBoundingClientRect().width;
        return (renderTargetWidth - this.getSVGWidth() + chartMargins.left);
    }

    private getTopOffset(chartMargins) {
        //NOTE - this assumes that the svg's bottom border is the same as the render target's
        var renderTargetHeight = this.renderTarget.node().getBoundingClientRect().height;
        return (renderTargetHeight - this.getSVGHeight() + chartMargins.top);
    }

    private isRightOffset (tooltipWidth, xPos, chartMarginLeft) {
        //NOTE - this assumes that the svg's right border is the same as the render target's
        var renderTargetWidth = this.renderTarget.node().getBoundingClientRect().width;
        return this.getSVGWidth() > (xPos + tooltipWidth + 20 + chartMarginLeft);
    }

    private isTopOffset (tooltipHeight, yPos, chartMarginBottom) {
        //NOTE - this assumes that the svg's bottom border is the same as the render target's
        var renderTargetHeight = this.renderTarget.node().getBoundingClientRect().height;
        return renderTargetHeight > (yPos + tooltipHeight + 20 + chartMarginBottom);
    }


    public render(theme) {
        let self = this;
        let tooltip = this.renderTarget.selectAll('.tsi-tooltip').filter(function () {
            return (this.parentNode === self.renderTarget.node());
        }).data([theme]);

        this.tooltipDiv = tooltip.enter().append('div')
            .attr('class', 'tsi-tooltip')
            .merge(tooltip)
            .each(function (d) {
                d3.select(this).selectAll("*").remove();
                self.tooltipDivInner = d3.select(this).append('div')
                    .attr('class', 'tsi-tooltipInner');
            });
        tooltip.exit().remove();
        super.themify(this.tooltipDiv, theme);
        
        //  element width is an optional parameter which ensurea that the tooltip doesn't interfere with the element
        //when positioning to the right
        this.draw = (d: any, chartComponentData: ChartComponentData, xPos, yPos, chartMargins, addText, elementWidth: number = null, xOffset = 20, yOffset = 20, borderColor: string = null) => {
            this.tooltipDiv.style("display", "block"); 
            this.tooltipDivInner.text(null);

            this.borderColor = borderColor;

            var leftOffset = this.getLeftOffset(chartMargins);
            var topOffset = this.getTopOffset(chartMargins)
            addText(this.tooltipDivInner);

            this.tooltipDiv.style("left", Math.round(xPos + leftOffset) + "px")
                .style("top", Math.round(yPos) + topOffset + "px");
        
            var tooltipWidth = this.tooltipDiv.node().getBoundingClientRect().width;
            var tooltipHeight = this.tooltipDiv.node().getBoundingClientRect().height;
            var translateX = this.isRightOffset(tooltipWidth, xPos, chartMargins.left) ? xOffset : 
                (-Math.round(tooltipWidth) - xOffset - (elementWidth !== null ? elementWidth : 0));             
            translateX = Math.max(0 - xPos, translateX);
            var translateY = this.isTopOffset(tooltipHeight, yPos, chartMargins.bottom) ? yOffset :  (-Math.round(tooltipHeight) - yOffset);
            this.tooltipDiv.style("transform", "translate(" + translateX + "px," + translateY + "px)");
            if (this.borderColor) {
                this.tooltipDivInner.style('border-left-color', this.borderColor)
                    .style('border-left-width', '5px');
            } else {
                this.tooltipDivInner.style('border-left-width', '0');
            }
        }
    }

}

export {Tooltip}