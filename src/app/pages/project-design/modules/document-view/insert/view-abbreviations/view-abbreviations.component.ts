import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import * as moment from 'moment';
import { LocalDataSource, ViewCell } from '../../../../../../@core/components/ng2-smart-table';
import { DesignerService } from '../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { TemplateService } from '../../../../services/template.service';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../../@models/common/dialog';
import { NbDialogService } from '@nebular/theme';
import { ConfirmationDialogComponent } from '../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { DocumentViewService } from '../../../../services/document-view.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { AbbreviationViewModel, LibraryEnum } from '../../../../../../@models/projectDesigner/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DesignerService as DesignerServiceAdmin} from '../../../../../admin/services/designer.service';

@Component({
  selector: 'button-view',
  template: `
    <input [ngClass]="inputClass"
           type="text"
           class="form-control"
           [value]="value"
           (change)="onChange($event)">
    `,
})

export class AppTextBoxAbbComponent implements ViewCell, OnInit {
  inputClass: string = '';
  row: any;
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService, private documentViewService: DocumentViewService, private _eventService: EventAggregatorService,private designerService: DesignerService) {
  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onChange(event: any) {
    this.row.abbreviation = event.target.value;
    if (this.designerService.isAdminModule) {
      let section = this.designerService.manageLibraryDetails.name.toLowerCase();
      if (section == LibraryEnum.globaloecd)
        this.row.isGlobalOecdTemplate = true;
      else if (section == LibraryEnum.countrytemplate)
        this.row.isCountryOecdTemplate = true;
    }
    else {
      this.row.isGlobalOecdTemplate = false;
      this.row.isCountryOecdTemplate = false;
    }
    this.documentViewService.updateAbbreviation(this.row)
      .subscribe((result: any) => {
        if (result.status.toString() == "1")
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).publish('reload');
      });
  }
}
@Component({
  selector: 'button-view',
  // styleUrls: ['./editor.component.scss'],
  template: `
    <input [ngClass]="inputClass"
           type="text"
           class="form-control"
           [value]="value"
           (change)="onChange($event)">
    `,
})

export class AppTextBoxFullFormComponent implements ViewCell, OnInit {
  row: any;
  inputClass: string = '';
  @Input() rowData: any;
  @Input() value: string | number;
  constructor(private readonly eventService: EventAggregatorService, private documentViewService: DocumentViewService, private _eventService: EventAggregatorService,private designerService: DesignerService) {
  }
  ngOnInit() {
    this.row = this.rowData;
  }
  onChange(event: any) {
    this.row.fullForm = event.target.value;
    if (this.designerService.isAdminModule) {
      let section = this.designerService.manageLibraryDetails.name.toLowerCase();
      if (section == LibraryEnum.globaloecd)
        this.row.isGlobalOecdTemplate = true;
      else if (section == LibraryEnum.countrytemplate)
        this.row.isCountryOecdTemplate = true;
    }
    else {
      this.row.isGlobalOecdTemplate = false;
      this.row.isCountryOecdTemplate = false;
    }
    this.documentViewService.updateAbbreviation(this.row)
      .subscribe((result: any) => {
        if (result.status.toString() == "1")
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).publish('reload');
      });
  }
}

@Component({
  selector: 'ngx-view-abbreviations',
  templateUrl: './view-abbreviations.component.html',
  styleUrls: ['./view-abbreviations.component.scss']
})
export class ViewAbbreviationsComponent implements OnInit, OnDestroy {
  source: LocalDataSource = new LocalDataSource();
  subscriptions: Subscription = new Subscription();
  customActionArray: Array<{ id: string, value: string }> = [];
  projectId: any;
  constructor(private designerService: DesignerService,private DialogService: DialogService, 
    private translate: TranslateService, private designerServiceAdmin: DesignerServiceAdmin,
private toastr: ToastrService,private _eventService: EventAggregatorService, private documentViewService: DocumentViewService, private dialogService: DialogService, private dService: NbDialogService, private dialog: MatDialog, private sharedService: ShareDetailService) { }

  ngOnInit() {
    if (this.designerService.isAdminModule) {
      this.projectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
    }
    else {
      var orgDetails = this.sharedService.getORganizationDetail();
      this.projectId = orgDetails.projectId;
    }
    this.getAbbreviationData(); 
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).subscribe((payload) => {
      if (payload == 'reload')
        this.getAbbreviationData();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.deleteAbbreviations).subscribe((abbreviationIds: string[]) => {
      this.openDeleteConfirmDialog(abbreviationIds);
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.searchAbbreviations).subscribe((payload:any) => {
      this.source.load(payload);
      // this.searchAbbreviationData(searchText);
    }))
  }
  settings = {
    selectMode: 'multi',
    hideSubHeader: true,
    actions: {
      columnTitle: '',
      class: 'testclass',
      delete: false,
      edit: false,
      custom: [
        {
          name: 'remove',
          title: '<img src="assets/images/projectdesigner/header/Remove.svg" class="removeTempIcon smallIcon">'
        }
      ],
      position: 'right'
    },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      abbreviation: {
        title: this.translate.instant('Abbreviation'),
        type: 'custom',
        renderComponent: AppTextBoxAbbComponent
      },
      fullForm: {
        title: this.translate.instant('FullForm'),
        type: 'custom',
        renderComponent: AppTextBoxFullFormComponent
      },
    },
    // edit: {
    //   editButtonContent: '<img src="assets/images/projectdesigner/header/Edit_without hover.svg" class="smallIcon">',
    //   saveButtonContent: '<i class="ion-checkmark smallIcon"></i>',
    //   cancelButtonContent: '<i class="ion-close smallIcon"></i>',
    //   confirmSave: true
    // },
    mode: 'inline',
    rowClassFunction: (row) => {
      if (row.data.isDefault == true) {
        var element = document.getElementsByClassName("removeTempIcon");
        element[element.length - 1].classList.add('hide');
        return '';
      } else {
        return '';
      }
    }
  }
  getAbbreviationData() {
    if (this.designerService.isAdminModule) {
      var templateOrDeliverableId = "";
      let section = this.designerService.manageLibraryDetails.name.toLowerCase();
      if (section == LibraryEnum.globaloecd)
        templateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
      else if (section == LibraryEnum.countrytemplate)
        templateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
    }
    else {
      var templateOrDeliverableId = "";
      if (this.designerService.isTemplateSection === true)
        templateOrDeliverableId = this.designerService.templateDetails.templateId;
      else if(this.designerService.isDeliverableSection === true)
      templateOrDeliverableId = this.designerService.deliverableDetails.entityId;
    }
    this.documentViewService.getallabbreviationslist(this.projectId,templateOrDeliverableId)
      .subscribe((data: AbbreviationViewModel[]) => {
        this.source.load(data);
      });
  }
  searchAbbreviationData(projectId,templateDeliverableId,searchText) {
    this.documentViewService.searchabbreviations(projectId,templateDeliverableId,searchText);
    this.source["data"].forEach(ele => {
      var action = this.customActionArray.filter(function (element, index, array) { return element["abbreviation"] == ele["abbreviation"] });
      // if (action[0]['value'] == 'View less') {
      //   action[0].value = 'View more';
      //   this.deleteRow(ele["id"]);
      // }
    });
    let value = "";
  }
  onAbbreviationSelect(event) {
    if (event.selected) {
      this.designerService.selectedAbbreviationIds = [];
      event.selected.forEach(abbreviation => {
        this.designerService.selectedAbbreviationIds.push(abbreviation.id);
      });
    }
  }

  onEditSave(event) {
  }
  customAction(event) {
    if (event.action == "remove") {
      let abbreviationIds: string[] = [];
      abbreviationIds.push(event.data.id);
      this.openDeleteConfirmDialog(abbreviationIds);
    }
  }
  private dialogTemplate: Dialog;
  openDeleteConfirmDialog(abbreviationIds: string[]): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.designerService.isAdminModule) {
          let section = this.designerService.manageLibraryDetails.name.toLowerCase();
          let abbreviationViewModel: AbbreviationViewModel = new AbbreviationViewModel();
          abbreviationViewModel.ProjectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
          abbreviationViewModel.IsTemplate = true;
          if (section == LibraryEnum.globaloecd) {
            abbreviationViewModel.TemplateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
            abbreviationViewModel.isGlobalOecdTemplate = true;
          }
          else if (section == LibraryEnum.countrytemplate) {
            abbreviationViewModel.TemplateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
            abbreviationViewModel.isCountryOecdTemplate = true;
          }
          abbreviationViewModel.Ids = abbreviationIds;
          this.deleteAbbreviationForAdmin(abbreviationViewModel);
        }    
        else {  
          this.deleteAbbreviation(abbreviationIds);
        }
      }
    });
  }

  deleteAbbreviationForAdmin(abbreviationViewModel:AbbreviationViewModel) {
    if (!abbreviationViewModel.Ids || !abbreviationViewModel.Ids.length) {
      this.DialogService.Open(DialogTypes.Warning, "Please select atleast one record to delete!");
      return;
    }
    this.documentViewService.deleteAbbreviationForAdmin(abbreviationViewModel).subscribe((result: any) => {
      this.toastr.success(this.translate.instant('screens.home.labels.deleteAbbreviationRecord'));
     
      this.getAbbreviationData();
    })
  }

  deleteAbbreviation(abbreviationIds: string[]) {
    if (!(abbreviationIds.length>0)) {
      this.DialogService.Open(DialogTypes.Warning, "Please select atleast one record to delete!");
      return;
    }
    this.documentViewService.deleteAbbreviation(abbreviationIds).subscribe((result: any) => {
      this.toastr.success(this.translate.instant('screens.home.labels.deleteAbbreviationRecord'));
     
      this.getAbbreviationData();
    })
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
