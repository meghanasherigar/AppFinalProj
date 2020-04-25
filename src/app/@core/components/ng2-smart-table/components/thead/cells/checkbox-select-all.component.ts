import { Component, Input } from '@angular/core';

import { Grid } from '../../../lib/grid';
import { DataSource } from '../../../lib/data-source/data-source';

@Component({
  selector: '[ng2-st-checkbox-select-all]', 
  styleUrls: ['./checkbox-select-all.component.scss'],
  template: `
    <div><input type="checkbox" class="form-control-headcheckbox" [ngModel]="isAllSelected"></div>
  `,
})
export class CheckboxSelectAllComponent {

  @Input() grid: Grid;
  @Input() source: DataSource;
  @Input() isAllSelected: boolean;
}
