import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cell } from './Cell.js';
import { Popover } from 'common/components/popover/PopoverComponent.js';

@Component({
  selector: 'g[heat-cell-series]',
  directives: [Cell, Popover],
  template: `
    <svg:g>
      <svg:g cell *ngFor="let c of cells"
        [x]="c.x"
        [y]="c.y"
        [width]="c.width"
        [height]="c.height"
        [fill]="c.fill"
        [data]="c.data"
        (clickHandler)="click($event)"
        sw-popover
        [popoverSpacing]="15"
        [popoverText]="c.tooltipText"
        [popoverGroup]="'charts'"
      />
    </svg:g>
  `
})
export class HeatCellSeries {
  @Input() data;
  @Input() colors;
  @Input() xScale;
  @Input() yScale;

  @Output() clickHandler = new EventEmitter();

  ngOnInit() {
    this.cells = this.getCells();
  }

  getCells(){
    let cells = [];

    this.data.map((series, index0) => {
      series.array.map((cell, index1) => {
        let value = cell.vals[0].value;
        let label = cell.vals[0].label[0];

        cells.push({
          x: this.xScale(label[0]),
          y: this.yScale(label[1]),
          width: this.xScale.rangeBand(),
          height: this.yScale.rangeBand(),
          fill: this.colors(value),
          data: cell.vals[0],
          tooltipText: `${label}: ${value}`
        });
      });
    });

    return cells;
  }

  click(data){
    this.clickHandler.emit(data);
  }

}