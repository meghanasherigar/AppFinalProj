import { Component, OnInit, PipeTransform, Pipe } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DesignerService } from '../../../../services/designer.service';
import { TranslateService } from '@ngx-translate/core';
import MultirootEditor from '../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { NbDialogRef } from '@nebular/theme';
import { TableTypeDomainModel, CellValue } from '../../../../../../@models/projectDesigner/task';
import { DomSanitizer } from '@angular/platform-browser';
import { CustomHTML } from '../../../../../../shared/services/custom-html.service';
import { QuestionType } from '../../../../../../@models/projectDesigner/infoGathering';

@Component({
  selector: 'ngx-table-type-question',
  templateUrl: './table-type-question.component.html',
  styleUrls: ['./table-type-question.component.scss']
})
export class TableTypeQuestionComponent implements OnInit {
  public editorValues: any = '';
  public readonly: boolean;
  editor: any;
  subscriptions: Subscription = new Subscription();
  contentBody: string;
  selectionChange: boolean = false;
  tableDataStart: string;
  tableDataEnd: string;
  finalTableData: TableTypeDomainModel;
  section: TableTypeDomainModel;
  innerHtmlTableType: string = '';
  TableText: boolean = true;
  ComparabilityText: boolean = false;
  BenchmarkText: boolean = false;
  PLText: boolean = false;
  ListText: boolean = false;
  isLogicType: boolean;
  position: number;
  noOfRows: any = 5;
  noOfColumns: any = 5;
  isDynamicTable: boolean = false;
  dynamicTableData: TableTypeDomainModel = new TableTypeDomainModel();

  constructor(
    protected ref: NbDialogRef<any>,
    private taskService: TaskService,
    private readonly _eventService: EventAggregatorService,
    private readonly _sharedService: ShareDetailService,
    private designerService: DesignerService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private customHTML: CustomHTML
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if(!this.isDynamicTable){
      this.setInnerHtmlForTableType();
    }
    let sourceElement: any = {};
    if (this.section) {
      let tableTypeEditor = document.querySelector('#tableTypeeditor');
      tableTypeEditor.innerHTML = this.section.text;
      this.innerHtmlTableType = this.section.text;
      this.section.cellValues.forEach((cell, index) => {
        tableTypeEditor.getElementsByTagName('td')[index].setAttribute('id', cell.id);
        tableTypeEditor.getElementsByTagName('td')[index].innerHTML = cell.value;
      });

    }
    else {
      sourceElement = {
        tablTypeHeader: document.querySelector('#tableTypeeditor')
      };
    }
    sourceElement = { tablTypeHeader: document.querySelector('#tableTypeeditor') };
    MultirootEditor.create1(sourceElement, undefined, undefined, this.designerService.definedColorCodes,this.translate.currentLang)
      .then(newEditor => {
        document.querySelector('#tableType-toolbar-menu').appendChild(newEditor.ui.view.toolbar.element);
        this.editor = newEditor;
        this.editor.setData({ tablTypeHeader: this.innerHtmlTableType });
      })
      .catch(err => {
        console.error(err.stack);
      });
  }


  setInnerHtmlForTableType() {
    if (this.designerService.questionType.typeName == QuestionType.TableType) {
      this.TableText = true;
      this.ComparabilityText = false;
      this.BenchmarkText = false;
      this.PLText = false;
      this.ListText = false;
      this.CreateUserDefinedTableType(0);
    }
    else if (this.designerService.questionType.typeName == QuestionType.ComparabilityAnalysisType) {
      this.TableText = false;
      this.ComparabilityText = true;
      this.BenchmarkText = false;
      this.PLText = false;
      this.ListText = false;
      this.innerHtmlTableType = '<table><tbody><tr><td>&nbsp;</td><td><p>Entity 1 – Responsible&nbsp;</p><p>Entity?</p></td><td><p>Entity 2 – Responsible&nbsp;</p><p>Entity?</p></td></tr><tr><td>Function 1</td><td>X</td><td>&nbsp;</td></tr><tr><td>Function 2</td><td>&nbsp;</td><td>X</td></tr></tbody></table>';
    }
    else if (this.designerService.questionType.typeName ==  QuestionType.BenchmarkRangeType) {
      this.TableText = false;
      this.ComparabilityText = false;
      this.BenchmarkText = true;
      this.PLText = false;
      this.ListText = false;
      this.innerHtmlTableType = '<table><tbody><tr><td>Entity</td><td><p>Analyzed</p><p>&nbsp;period</p></td><td>Economic Indicator</td><td><p>Lower value of the arms&nbsp;</p><p>length range</p></td><td><p>Median</p><p>&nbsp;</p></td><td><p>Upper value of the arms&nbsp;</p><p>length range</p></td></tr><tr><td>#LegalEntityName</td><td><p>2015 -</p><p>2017</p></td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>';
    }
    else if (this.designerService.questionType.typeName == QuestionType.PLQuestionType) {
      this.TableText = false;
      this.ComparabilityText = false;
      this.BenchmarkText = false;
      this.PLText = true;
      this.ListText = false;
      this.innerHtmlTableType = '<table><tbody><tr><td>&nbsp;</td><td>#LegalEntityName</td></tr><tr><td>Sales</td><td>&nbsp;</td></tr><tr><td>COGS</td><td>&nbsp;</td></tr><tr><td>Gross profit</td><td>&nbsp;</td></tr><tr><td>Operating expenses</td><td>&nbsp;</td></tr><tr><td>Operating profit</td><td>&nbsp;</td></tr></tbody></table>';
    }
    else if (this.designerService.questionType.typeName == QuestionType.ListType) {
      this.TableText = false;
      this.ComparabilityText = false;
      this.BenchmarkText = false;
      this.PLText = false;
      this.ListText = true;
      this.innerHtmlTableType = '<table><tbody><tr><td><p>Level below the&nbsp;</p><p>block heading&nbsp;</p><p>level</p></td><td>Name/Title</td><td>Content</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>';
    }
  }
      
  CreateUserDefinedTableType(value){
    if(value == 1){
      this.retainTableData();
    }
    let columns: any = '';
    let dynamicColumns: any = '';
    let rows: any = '';
    let dynamicRows: any = '';
    if(this.noOfColumns != null && this.noOfRows != null && this.noOfColumns != 0 && this.noOfRows != 0){
      for (let j = 0; j < this.noOfRows; j++) {
        for (let i = 0; i < this.noOfColumns; i++) {
          if(this.dynamicTableData.cellValues.length != 0){
            columns = '<td></td>';
              this.dynamicTableData.cellValues.forEach(item =>{
                if(item.key == String(j) + ":" + String(i)){
                  return columns = '<td>' + item.value + '</td>';
                }
              });
            dynamicColumns = dynamicColumns + columns;
          }
          else{
            columns = '<td></td>';
            dynamicColumns = dynamicColumns + columns;
          }
        }
        rows = '<tr>' + dynamicColumns + '</tr>';
        dynamicRows = dynamicRows + rows;
        dynamicColumns = '';
      }
      this.innerHtmlTableType = '<table><tbody>' + dynamicRows + '</tbody></table>';
      if(value == 1){
        this.isDynamicTable = true;
        if (this.editor != undefined) {
          if (document.querySelector('#tableType-toolbar-menu') != undefined){
            document.querySelector('#tableType-toolbar-menu').removeChild(this.editor.ui.view.toolbar.element);
          }
          this.editor.destroy();
          this.editor = undefined;
        }
        this.ngAfterViewInit();
      }
    }
  }

  retainTableData(){
    let headerNames = this.editor.model.document.getRootNames();
    let tableDataHtmlString: string;
    for (const rootName of headerNames) {
      if (rootName == QuestionType.tablTypeHeader) {
        let data = this.editor.getData({ rootName: rootName });
        this.contentBody = this.customHTML.multiRootEditorSetResizedWidth(rootName, data);
        var divElement = document.createElement("div");
        divElement.innerHTML = this.contentBody;
        tableDataHtmlString = divElement.getElementsByTagName('table').length > 0 ? divElement.getElementsByTagName('table')[0].outerHTML : "";
      }
    }
    this.dynamicTableData = new TableTypeDomainModel();
    this.dynamicTableData.text = tableDataHtmlString;
    let tableLength = document.getElementsByTagName('Table').length;
    var tableData: any = document.getElementsByTagName('Table')[tableLength - 1] as HTMLTableElement;
    if (tableData != undefined) {
      this.dynamicTableData.rows = tableData.rows.length;
      this.dynamicTableData.columns = tableData.rows[0].cells.length; //tableData.columns.length;
      this.dynamicTableData.cellValues = new Array<CellValue>();
      for (var i = 0; i < this.dynamicTableData.rows; i += 1) {
        var row = tableData.rows[i];
        var cellLength = row.cells.length;
        for (var y = 0; y < cellLength; y += 1) {
          var cell = row.cells[y];
          let cellObject = new CellValue();
          if (i == 0 && y >= 0) {
            cellObject.isEditable = false;
          }
          else if (i > 0 && y == 0) {
            cellObject.isEditable = false;
          }
          else {
            cellObject.isEditable = true;
          }
          cellObject.key = String(i) + ":" + String(y);
          cellObject.value = cell.innerHTML;
          this.dynamicTableData.cellValues.push(cellObject);
        }
      }
    }
  }

  saveDataLocal() {
    let headerNames = this.editor.model.document.getRootNames();
    let tableDataHtmlString: string;
    for (const rootName of headerNames) {
      if (rootName == QuestionType.tablTypeHeader) {
        let data = this.editor.getData({ rootName: rootName });
        this.contentBody = this.customHTML.multiRootEditorSetResizedWidth(rootName, data);
        var divElement = document.createElement("div");
        divElement.innerHTML = this.contentBody;
        tableDataHtmlString = divElement.getElementsByTagName('table').length > 0 ? divElement.getElementsByTagName('table')[0].outerHTML : "";
      }
    }
    let tableTypeModel: TableTypeDomainModel = new TableTypeDomainModel();
    tableTypeModel.text = tableDataHtmlString;
    let tableLength = document.getElementsByTagName('Table').length;
    var tableData: any = document.getElementsByTagName('Table')[tableLength - 1] as HTMLTableElement;
    if (tableData != undefined) {
      tableTypeModel.rows = tableData.rows.length;
      tableTypeModel.columns = tableData.rows[0].cells.length; //tableData.columns.length;
      tableTypeModel.cellValues = new Array<CellValue>();
      for (var i = 0; i < tableTypeModel.rows; i += 1) {
        var row = tableData.rows[i];
        var cellLength = row.cells.length;
        for (var y = 0; y < cellLength; y += 1) {
          var cell = row.cells[y];
          let cellObject = new CellValue();
          if (i == 0 && y >= 0) {
            cellObject.isEditable = false;
          }
          else if (i > 0 && y == 0) {
            cellObject.isEditable = false;
          }
          else {
            cellObject.isEditable = true;
          }
          cellObject.key = String(i) + ":" + String(y);
          cellObject.value = cell.innerHTML;
          tableTypeModel.cellValues.push(cellObject);
        }
      }
    }
    this.designerService.createQuestionTableType = tableTypeModel;
    this.designerService.isTableTypeInLogicType = false;
    if (this.isLogicType) {
      this.designerService.isTableTypeInLogicType = true;
      if (this.position + 1 > this.designerService.tableTypeData.length) {
        for (let i = 0; i < (this.position + 1) - this.designerService.tableTypeData.length; i++) {
          let tableData = new TableTypeDomainModel();
          this.designerService.tableTypeData.push(tableData);
        }
      }
      this.designerService.tableTypeData[this.position] = tableTypeModel;
    }
    this.dismiss();
  }

  dismiss() {
    this.ref.close();
  }

}
