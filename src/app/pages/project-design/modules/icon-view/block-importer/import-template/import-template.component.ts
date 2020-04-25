import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DesignerService } from '../../../../services/designer.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { TemplateService } from '../../../../services/template.service';
import { TemplateDetailsRequestModel, TemplateDeliverableViewModel, ImportTemplateRequest } from '../../../../../../@models/projectDesigner/template';
import { LibraryOptions } from '../../../../../../@models/projectDesigner/block';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';

@Component({
  selector: 'ngx-import-template',
  templateUrl: './import-template.component.html',
  styleUrls: ['./import-template.component.scss']
})
export class ImportTemplateComponent implements OnInit {

  importTemplate: FormGroup;
  projectDetails: ProjectContext;
  dropdownSettings: {};
  submitted: boolean = false;
  OECDTemplate = LibraryOptions.OECDtemplates;
  Countrytemplates = LibraryOptions.Countrytemplates;
  templateList: any;
  selectedEntityItems = [];
  result: string;
  noTemplates: boolean = false;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  get form() { return this.importTemplate.controls; }
  constructor(protected ref: NbDialogRef<any>, private formBuilder: FormBuilder,private readonly _eventService: EventAggregatorService,
    private designerService: DesignerService, private sharedService: ShareDetailService, private templateService: TemplateService) { 
    this.importTemplate = this.formBuilder.group({
      libraryTemplates: [''],
      templateName: ['',  Validators.required],
      selectedTemplates: ['']
    });
  }
  
  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'templateId',
      textField: 'templateName',
      allowSearchFilter: true,
    }
    this.importTemplate.controls["libraryTemplates"].setValue("Global OECD Template");
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.templateDetailsRequestModel.projectId = this.projectDetails.projectId;
    this.templateDetailsRequestModel.PageIndex = 1;
    this.templateDetailsRequestModel.PageSize = 100;
    this.templateService.getalltemplatelist(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.templateList = data;
    });
  }

  

  dismiss() {
    this.ref.close();
  }

  importTemplates() {
    this.submitted = true;
    if (this.importTemplate.invalid) {
      return;
    }

    let data = this.importTemplate.value;
    let request = new ImportTemplateRequest();
    request.TemplateId = data.selectedTemplates[0].templateId;
    request.IsCountryTemplate = (data.libraryTemplates === LibraryOptions.Countrytemplates) ? true : false;
    request.IsGlobalTemplate = (data.libraryTemplates === LibraryOptions.OECDtemplates) ? true : false;
    this.templateService.ImportTemplates(request).subscribe((result) => {
      if(result) {
        this.noTemplates = true;
        this.result = result
        return;
      } else {
        this.noTemplates = false;
      let themingContext = this.sharedService.getSelectedTheme();
      if(themingContext !=null){
        let _templateList = themingContext.themeOptions.filter(item => item.data && item.data.template != null);
        _templateList.forEach(item=>{
          this._eventService.getEvent(item.name + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(item.data.template);
        });
      }
      else
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadTemplate).publish(this.designerService.templateDetails);
        this.ref.close();
      }
    })
    
  }

  onTemplateSelect(item: any) {
    if (this.importTemplate.value.selectedTemplates && this.importTemplate.value.selectedTemplates.length > 0)
      this.importTemplate.controls["templateName"].setValue(this.importTemplate.value.selectedTemplates);
    else
      this.importTemplate.controls["templateName"].setValue("");
  }

}
