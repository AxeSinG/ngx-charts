import { Component, Input, Output, EventEmitter } from '@angular/core';
import { calculateViewDimensions } from '../common/viewDimensions';
import { colorHelper } from '../utils/colorSets';
import { Chart } from '../common/charts/Chart';
import { BaseChart } from '../BaseChart';
import { XAxis } from '../common/axes/XAxis';
import { YAxis } from '../common/axes/YAxis';
import { LineSeries } from './LineSeries';
import { CircleSeries } from '../common/CircleSeries';
import { Timeline } from '../common/Timeline';
import { showTooltip, updateTooltip, hideTooltip } from '../common/lineAreaHelpers';

@Component({
  selector: 'line-chart-2-d',
  directives: [Chart, XAxis, YAxis, LineSeries, CircleSeries, Timeline],
  template: `
    <chart
      [legend]="legend"
      [view]="view"
      [colors]="colors"
      [legendData]="results.legend">

      <svg:defs>
        <svg:clipPath id="clipPathId">
          <svg:rect
            [attr.width]="dims.width + 10"
            [attr.height]="dims.height + 10"
            [attr.transform]="'translate(-5, -5)'"/>
        </svg:clipPath>
      </svg:defs>

      <svg:g [attr.transform]="transform" class="viz line chart">
        <svg:g x-axis
          *ngIf="xaxis"
          [xScale]="xScale"
          [dims]="dims"
          [showGridLines]="true"
          [showLabel]="showXAxisLabel"
          [labelText]="xaxisLabel">
        </svg:g>

        <svg:g y-axis
          *ngIf="yaxis"
          [yScale]="yScale"
          [dims]="dims"
          [showGridLines]="true"
          [showLabel]="showYAxisLabel"
          [labelText]="yaxisLabel">
        </svg:g>

        <svg:g [attr.clip-path]="clipPath">

          <svg:g *ngFor="let series of results.series">
            <svg:g line-series
              [xScale]="xScale"
              [yScale]="yScale"
              [color]="colors(series.name)"
              [data]="series.array"
              [scaleType]="scaleType"
            />
          </svg:g>

          <svg:rect
            class="tooltip-area"
            [attr.width]="dims.width + 10"
            [attr.height]="dims.height + 10"
            x="-5"
            y="-5"
            style="fill: rgb(255, 0, 0); opacity: 0; cursor: 'auto';"
          />

          <svg:g *ngFor="let series of results.series">
            <svg:g circle-series
              [xScale]="xScale"
              [yScale]="yScale"
              [color]="colors(series.name)"
              [data]="series.array"
              [scaleType]="scaleType"
              [chartType]="'line'"
              (clickHandler)="click($event)"
            />
          </svg:g>

        </svg:g>
      </svg:g>

      <svg:g timeline
        *ngIf="timeline && scaleType === 'time'"
        [results]="results"
        [view]="view"
        [scheme]="scheme"
        [customColors]="customColors"
        [legend]="legend">
      </svg:g>
    </chart>
  `
})
export class LineChart2D extends BaseChart {
  @Input() view;
  @Input() results;
  @Input() margin = [10, 20, 70, 70];
  @Input() scheme;
  @Input() customColors;
  @Input() legend = false;
  @Input() xaxis;
  @Input() yaxis;
  @Input() showXAxisLabel;
  @Input() showYAxisLabel;
  @Input() xaxisLabel;
  @Input() yaxisLabel;
  @Input() autoScale;
  @Input() timeline;

  @Output() clickHandler = new EventEmitter();

  ngOnInit() {
    this.dims = calculateViewDimensions(this.view, this.margin, this.showXAxisLabel, this.showYAxisLabel, this.legend, 9);

    if (this.timeline){
      this.dims.height -= 150;
    }

    if (this.results.query && this.results.query.dimensions[0].field.fieldType === 'date' && this.results.query.dimensions[0].groupByType.value === 'groupBy'){
      let domain;
      if (this.xDomain){
        domain = this.xDomain;
      } else {
        domain = d3.extent(this.results.d0Domain, function (d) { return moment(d).toDate(); })
      }
      this.scaleType = 'time';
      this.xScale = d3.time.scale()
        .range([0, this.dims.width])
        .domain(domain);
    } else {
      this.scaleType = 'ordinal'
      this.xScale = d3.scale.ordinal()
        .rangePoints([0, this.dims.width], 0.1)
        .domain(this.results.d0Domain);
    }

    this.yScale = d3.scale.linear()
      .range([this.dims.height, 0], 0.1)
      .domain(this.results.m0Domain);

    if (!this.autoScale) {
      this.yScale.domain([0, this.results.m0Domain[1]]);
    }

    this.setColors();

    this.transform = `translate(${ this.dims.xOffset } , ${ this.margin[0] })`;;
    let pageUrl = window.location.href;
    let clipPathId = 'clip' + ObjectId().toString();
    this.clipPath = `url(${pageUrl}#${clipPathId})`;
  }

  click(data){
    this.clickHandler.emit(data);
  }

  setColors(){
    this.colors = colorHelper(this.scheme, 'ordinal', this.results.d1Domain, this.customColors);
  }
}