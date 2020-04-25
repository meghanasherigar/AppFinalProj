import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { GridColumn } from '../../@models/deliverable/deliverable-columns';
import { ProjectDeliverableService } from '../../services/project-deliverable.service';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { ProjectManagementService } from '../../services/project-management.service';

@Component({
  selector: 'ngx-deliverable-column-list',
  templateUrl: './deliverable-column-list.component.html',
  styleUrls: ['./deliverable-column-list.component.scss']
})
export class DeliverableColumnListComponent implements OnInit {

  availableColumnList: Array<GridColumn> = new Array<GridColumn>();
  selectedColumnList: Array<GridColumn> = new Array<GridColumn>();
  
  selectedUserColumn: Array<GridColumn> = new Array<GridColumn>();
  selectedAvailableColumn: Array<GridColumn> = new Array<GridColumn>();

  //ngx-ui-loader configuration
  loaderId = 'gridCustomizationLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';

  constructor(protected ref: NbDialogRef<any>,
    private projDeliverableService: ProjectDeliverableService,
    private ngxLoader: NgxUiLoaderService,
    private managementService:ProjectManagementService
  ) { }

  ngOnInit() {
    this.resetSelectedColumns();
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projDeliverableService.userGridColumns().subscribe(response => {
      if (response) {
        this.selectedColumnList = response.userGridColumns;
        //Inlcude columns not selected by the user in the available columns list
        this.availableColumnList =
          response.masterGridColumns.filter(master => {
            return !response.userGridColumns.some(userColumns => {
              return userColumns.columnName === master.columnName;
            });
          });
      }
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
    });

  }

  onAvailableColumnSelect(column) {
    let index = this.selectedAvailableColumn.indexOf(column);
    if (index < 0) {
      this.selectedAvailableColumn.push(column);
    }
    else {
      if (index > -1) {
        this.selectedAvailableColumn.splice(index, 1);
      }
    }
  }

  onUserColumnSelection(column) {

    let index = this.selectedUserColumn.indexOf(column);
    if (column.removable && index < 0) {
      this.selectedUserColumn.push(column);
    }
    else {
      //Remove the column
      if (index > -1) {
        this.selectedUserColumn.splice(index, 1);
      }
    }
  }

  addToSelection() {
    if (this.selectedAvailableColumn.length > 0) {
      this.selectedAvailableColumn.forEach(column => {
        this.selectedColumnList.push(column);
        this.removeSelectedColumn(column,this.availableColumnList);
      });
      this.resetSelectedColumns();
    }
  }

  removeFromSelection() {
    if (this.selectedUserColumn.length > 0) {
      this.selectedUserColumn.forEach(column => {
        this.availableColumnList.push(column);
        this.removeSelectedColumn(column,this.selectedColumnList);
      });
      this.resetSelectedColumns();
    }
  }

  resetSelectedColumns() {
    this.selectedUserColumn = new Array<GridColumn>();
    this.selectedAvailableColumn = new Array<GridColumn>();
  }

  onSave() {
    if(this.selectedColumnList.length>0)
    {
    this.reIndexForSave();
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.projDeliverableService.updateUserGridSettings(this.selectedColumnList)
      .subscribe(response => {
        this.ngxLoader.stopBackgroundLoader(this.loaderId);
        this.ref.close();
        this.managementService.changeReloadDeliverableGrid(true);
      });
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      //Re-arrange only if its the selected column list, change list id
      if (event.previousContainer.id !== 'availableColumns') {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
    }
    else {
      if(event.container.id==='selectedColumns'){
        this.dropIntoList(event, this.selectedAvailableColumn, this.availableColumnList);
      }
        
        if(event.container.id==='availableColumns'){
        this.dropIntoList(event,this.selectedUserColumn, this.selectedColumnList);
      }
      }
    this.resetSelectedColumns();
  }

  dropIntoList(event: CdkDragDrop<any[]>, selectedList: GridColumn[],sourceList:GridColumn[])
  {
    if (selectedList.length > 0) {
      let targetIndex = event.currentIndex;
      //replica set
      let selectedColumns = JSON.parse(JSON.stringify(selectedList));

      selectedColumns.forEach((column, idx) => {
        transferArrayItem(selectedList, event.container.data, idx, targetIndex);
        targetIndex++;
        this.removeSelectedColumn(column, sourceList);

      });
      selectedColumns = [];
    }
    else {
      let canBeMoved: boolean = false;
      canBeMoved = event.previousContainer.data[event.previousIndex].removable ? true : false;
      //Allow drag-drop across lists only if permitted
      if (canBeMoved) {
        transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex,
          event.currentIndex);
      }
    }
  }

  removeSelectedColumn(column: GridColumn, ColumnList: GridColumn[]) {
    let index = ColumnList.findIndex(x => x.columnName === column.columnName);
    if (index >= 0) ColumnList.splice(index, 1);
  }

  reIndexForSave() {
    this.selectedColumnList.forEach((ele, idx) => {
      ele.sequence = idx;
    });
    //console.log(`User column selection-${JSON.stringify(this.selectedColumnList)}`);
  }

  onCancel() {
    this.ref.close();
  }
}