import { Component, OnInit, Input } from '@angular/core';
import { Designer, SubMenus } from '../../../../../../../../@models/projectDesigner/designer';
import { DesignerService } from '../../services/designer.service';
import { viewAttributeModel, regions } from '../../../../../../../../@models/projectDesigner/common';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { Subscription } from 'rxjs';
import { DesignerService as old } from '../../../../../../services/designer.service';
import { Router } from '@angular/router';
import { SelectedSection } from '../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { TemplateViewModel } from '../../../../../../../../@models/projectDesigner/template';

@Component({
  selector: 'ngx-template-deliverable-header',
  templateUrl: './template-deliverable-header.component.html',
  styleUrls: ['./template-deliverable-header.component.scss']
})
export class TemplateDeliverableHeaderComponent implements OnInit {
  isEnableAttribute: boolean = false;
  @Input("section") section: any;
  @Input("selectedSection") selectedSection: any;

  designer = new Designer();
  subscriptions = new Subscription();

  constructor(private designerService: DesignerService, private _eventService: EventAggregatorService, private existingDesignerService: old, private router: Router, private sharedService: ShareDetailService) { }

  ngOnInit() {
    this._eventService.getEvent(EventConstants.ProjectInContext).publish(true);
  }

  showAttributeView() {
    if(!this.canNavigate()) return;

    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.mapDesigner();

    this.isEnableAttribute = true;
    this.designer.showIconFlag = false;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = this.designer.templateDetails != null ? regions.templates : this.designer.libraryDetails != null ? regions.library : regions.deliverables;
    this.designer.blockDetails = null;
    this.designer.blockList = [];
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  hideAttributeView() {
    this.isEnableAttribute = false;
    this.designer.showIconFlag = true;
    let payLoad = new viewAttributeModel();
    payLoad.regionType = regions.none;
    this.subscriptions.add(this._eventService.getEvent(EventConstants.TemplateSection).publish(payLoad));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  mapDesigner() {
    this.existingDesignerService.clear();
    this.existingDesignerService.templateDetails = this.existingDesignerService.deliverableDetails = null;
    this.existingDesignerService.templateDetails = this.designer.templateDetails;
    this.existingDesignerService.deliverableDetails = this.designer.deliverableDetails;
    this.existingDesignerService.entityDetails = this.designer.entityDetails;

    if (this.designer.deliverableDetails != null) {
      this.existingDesignerService.deliverabletemplateDetails = new TemplateViewModel();
      this.existingDesignerService.deliverabletemplateDetails.templateId = this.designer.deliverableDetails.templateId;
      this.existingDesignerService.deliverabletemplateDetails.templateName = this.designer.deliverableDetails.templateName;
    }
  }

  displayDocumentView() {
    //Navigate only if there's any data in drop down
    if(this.canNavigate())
    {
    this.designer = this.designerService.themeOptions.filter(item => item.name == this.section)[0].designerService;
    this.existingDesignerService.isLibrarySection = false;

    if (this.designer.templateDetails != null) {
      this.existingDesignerService.LoadAllBlocksDocumentView = true;
      this.existingDesignerService.isDeliverableSection = false;
      this.existingDesignerService.isTemplateSection = true;
      //TODO: Fetch the selected template from the drop down instead of 0th index Id
      this.existingDesignerService.templateDetails = this.designer.templateDetails;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.existingDesignerService.templateDetails);
      this.existingDesignerService.changeIsDocFullView(true);
    }
    else if (this.designer.deliverableDetails != null) {
      this.existingDesignerService.LoadAllBlocksDocumentView = true;
      this.existingDesignerService.isDeliverableSection = true;
      this.existingDesignerService.isTemplateSection = false;
      //TODO: Fetch the selected template from the drop down instead of 0th index Id
      this.existingDesignerService.deliverableDetails = this.designer.deliverableDetails;
      this.existingDesignerService.deliverabletemplateDetails = new TemplateViewModel();
      this.existingDesignerService.deliverabletemplateDetails.templateId = this.designer.deliverableDetails.templateId;
      this.existingDesignerService.deliverabletemplateDetails.templateName = this.designer.deliverableDetails.templateName;
      this.existingDesignerService.entityDetails = [];
      var entityDetails: any = {};
      entityDetails.entityId = this.designer.deliverableDetails.entityId;
      this.existingDesignerService.entityDetails.push(entityDetails);

      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate)
        .publish(this.designer.deliverableDetails);
      this.existingDesignerService.changeIsDocFullView(true);
    }
    else if (this.designer.libraryDetails != null) {
      this.existingDesignerService.libraryDetails = this.designer.libraryDetails;
      this.existingDesignerService.LoadAllBlocksDocumentView = true;
      this.existingDesignerService.isDeliverableSection = false;
      this.existingDesignerService.isTemplateSection = false;
      this.existingDesignerService.isLibrarySection = true;
      this.existingDesignerService.changeIsDocFullView(true);
    }
    this.saveSelectedThemeData();
      this.navigateToEditor();
    }
  }


  canNavigate()
  {
    //skip the check for library
    //if(this.existingDesignerService.libraryDetails) return true;
    let themeOpts= this.designerService.themeOptions.find(item => item.name == this.section);
    let oldDesigner;
    if(themeOpts) 
    {
       oldDesigner= themeOpts.designerService;
    }
    if(this.existingDesignerService.libraryDetails|| this.designer.libraryDetails|| (oldDesigner && oldDesigner.libraryDetails))
     return true; 

    //validate for template/deliverables
    let themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = themingContext.themeOptions.find(item => item.name == this.section);
    return (currentDesigner && currentDesigner.data && Object.keys(currentDesigner.data).length);
  }

  saveSelectedThemeData() {
    let themingContext = this.sharedService.getSelectedTheme();
    let currentDesigner = themingContext.themeOptions.find(item => item.name == this.section);
    const uniqueBlockList = new Set(this.designer.blockList);

    currentDesigner.designerService.blockList = Array.from(uniqueBlockList.values());
    currentDesigner.designerService.blockDetails = this.designer.blockDetails;

    this.sharedService.setSelectedTheme(themingContext);
  }

  navigateToEditor() {
    this.existingDesignerService.changeTabDocumentView(SubMenus.Editor);
    this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain', { outlets: { primary: ['editorregion'], level2Menu: ['editorlevel2menu'], topmenu: ['iconviewtopmenu'] } }]);
  }

}
