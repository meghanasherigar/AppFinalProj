import { Component, OnInit, ViewChild } from '@angular/core';
import { AbbreviationsComponent } from '../../abbreviations/abbreviations.component';
import { NbDialogService, NbPopoverDirective } from '@nebular/theme';
import { DesignerService } from '../../../../../services/designer.service';
import { Router } from '@angular/router';
import { SubMenus } from '../../../../../../../@models/projectDesigner/designer';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, AdminSection } from '../../../../../../../@models/common/eventConstants';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchAbbreviationViewModel, AbbreviationViewModel, LibraryEnum } from '../../../../../../../@models/projectDesigner/common';
import { DocumentViewService } from '../../../../../services/document-view.service';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { DesignerService as DesignerServiceAdmin } from '../../../../../../admin/services/designer.service';

@Component({
  selector: 'ngx-view-abb-level2-menu',
  templateUrl: './view-abb-level2-menu.component.html',
  styleUrls: ['./view-abb-level2-menu.component.scss']
})
export class ViewAbbLevel2MenuComponent implements OnInit {
  disable: boolean = false;
  searchText:string="";
  subscription=new Subscription();
  searchTextChanged = new Subject<string>();
  @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
  constructor(private dialogService:NbDialogService,private sharedService: ShareDetailService,private designerService:DesignerService,private router:Router,private _eventService: EventAggregatorService,private documentViewService: DocumentViewService,private designerServiceAdmin: DesignerServiceAdmin) { }

  ngOnInit() {
    this.subscription = this.searchTextChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe(()=>{this.searchAbbreviations()});
  }

  abbreviationPopup(){
    this.dialogService.open(AbbreviationsComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  dismiss()
  {
    this.popover.hide();
  }
  deleteAbbreviations()
  {
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.deleteAbbreviations).publish(this.designerService.selectedAbbreviationIds);   
  }
  closeAbbreviationTab(){
    if (this.designerService.isAdminModule) {
      let libraryPath: string;
      if(this.designerServiceAdmin.isGLobal)
        libraryPath = AdminSection.globalLibrary;
      else 
        libraryPath = AdminSection.countryLibrary;
      this.router.navigate(['pages/admin/adminMain', { outlets: { primary: [libraryPath], level2Menu: ['EditorLevel2MenuLibrary'], topmenu: ['libraryviewtopmenu'], leftNav: ['leftNav'] } }]);
      this.designerServiceAdmin.changeTabDocumentView(SubMenus.Insert); 
    }
    else {
      this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
      this.designerService.changeTabDocumentView(SubMenus.Insert);  
    }
  }
  searchAbbreviations() {    
    if(this.searchText.length>0){
      if (this.designerService.isAdminModule) {
        var projectId = this.designerServiceAdmin.dummyProjectDetails.projectId;
        var templateOrDeliverableId = "";
        let section = this.designerService.manageLibraryDetails.name.toLowerCase();
        if (section == LibraryEnum.globaloecd)
          templateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdGlobalTemplateId;
        else if (section == LibraryEnum.countrytemplate)
          templateOrDeliverableId = this.designerServiceAdmin.dummyProjectDetails.oecdCountryTemplateId;
      }
      else {
        let projectDetails = this.sharedService.getORganizationDetail();
        var projectId = projectDetails.projectId; 
        var templateOrDeliverableId = "";
        if (this.designerService.isTemplateSection === true)
          templateOrDeliverableId = this.designerService.templateDetails.templateId;
        else if(this.designerService.isDeliverableSection === true)
          templateOrDeliverableId = this.designerService.deliverableDetails.entityId;  
      }  
      this.documentViewService.searchabbreviations(projectId,templateOrDeliverableId,this.searchText)
      .subscribe((payload: AbbreviationViewModel[]) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.searchAbbreviations).publish(payload);
      });
    }
    else {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadAbbreviations).publish('reload');
    }
  }
}
