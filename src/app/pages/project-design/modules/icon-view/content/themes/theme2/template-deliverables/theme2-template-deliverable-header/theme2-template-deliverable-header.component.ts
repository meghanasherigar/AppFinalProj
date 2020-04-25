import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TreeviewItem, TreeviewConfig, TreeviewI18nDefault, TreeviewI18n, TreeviewSelection } from 'ngx-treeview';
import { ShareDetailService } from '../../../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../../../@models/organization';
import { TemplateDetailsRequestModel, TemplateViewModel } from '../../../../../../../../../@models/projectDesigner/template';
import { TemplateService } from '../../../../../../../services/template.service';
import { ThemingContext, Theme, ThemeCollection, ThemeOptions, ThemeSection } from '../../../../../../../../../@models/projectDesigner/theming';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../../shared/services/event/event.service';
import { ThemeService } from '../../../common/theme.service';
import { DeliverablesInput, DeliverableResponseViewModel } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { BlockDetailsResponseViewModel } from '../../../../../../../../../@models/projectDesigner/block';
import { DeliverableService } from '../../../../../../../services/deliverable.service';
import { DesignerService } from '../../../services/designer.service';
import { TreeViewService } from '../../../../../../../../../shared/services/tree-view.service';
import { TreeViewConstant, eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-theme2-template-deliverable-header',
  templateUrl: './theme2-template-deliverable-header.component.html',
  styleUrls: ['./theme2-template-deliverable-header.component.scss'],
  providers: [
    {
      provide: TreeviewI18n, useValue: Object.assign(new TreeviewI18nDefault(), {
        getText(selection: TreeviewSelection): string {
          var _selection = selection.checkedItems.filter(item => item.disabled == false);
          return TreeViewService.getTemplateDeliverableText(_selection, TreeViewConstant.templateDeliverables);
        },
      })
    }
  ]
})
export class Theme2TemplateDeliverableHeaderComponent implements OnInit {
  projectDetails: ProjectContext;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  templateDeliverableList: any;
  themingContext: ThemingContext;
  selectedThemeOption: ThemeOptions;
  @Input("section") section: string;
  @Input("data") sectionData: [];

  subscriptions: Subscription = new Subscription();
  @Input("section3TreeList") section3TreeList = [];
  @Output() viewLoaded = new EventEmitter();

  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 600
  });

  constructor(private readonly _eventService: EventAggregatorService, private sharedService: ShareDetailService, private templateService: TemplateService, private themeService: ThemeService, private deliverableService: DeliverableService, private designerService: DesignerService) { }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.themingContext = this.sharedService.getSelectedTheme();
    let selectedTheme = this.themingContext.themeOptions.filter(item => item.name == this.section)[0];
    
    //this.templateDeliverableList = this.designerService.templateDeliverableList;
    this.templateDeliverableList = this.designerService.templateDeliverableList && this.designerService.templateDeliverableList.length>0
    ?this.designerService.templateDeliverableList:this.sectionData;

    let selectedData = this.templateDeliverableList.templates.templatesDropDown.length > 0 ? this.templateDeliverableList.templates.templatesDropDown.find(x => x.isDefault == true) : undefined;

    if (!selectedData) {
      var _items: any = [];
      if (this.templateDeliverableList.templates.templatesDropDown.length > 0)
        _items.push(this.templateDeliverableList.templates.templatesDropDown[0]);

      if (_items.length == 0) {
        _items.push(this.templateDeliverableList.deliverables.deliverableResponse[0]);
        if (_items.length > 0) {
          if (_items[0].deliverables.length > 0) {
            _items = _items[0].deliverables;
          }
        }
      }

      if (_items.length > 0)
        selectedData = _items[0];
    }

    this.selectedThemeOption = this.themingContext.themeOptions.filter(item => item.name == this.section)[0];
    let selectedThemeData = {};
    selectedThemeData = Object.assign(selectedThemeData, this.selectedThemeOption);

    this.selectedThemeOption.data = new ThemeCollection();
    if (selectedData.templateId && !selectedData.entityId) {
      if (this.validateOriginalData(selectedThemeData)) {
        this.selectedThemeOption.data = selectedThemeData['data'];
      }
      else {
        this.selectedThemeOption.data.template = new TemplateViewModel();
        this.selectedThemeOption.data.template.templateId = selectedData.templateId;
        this.selectedThemeOption.data.template.templateName = selectedData.templateName;
      }
    }
    else if (selectedData.entityId) {
      if (this.validateOriginalData(selectedThemeData)) {
        let entityExists = this.templateDeliverableList.deliverables.deliverableResponse.find(c=>c.entityId === selectedThemeData['data'].deliverable.id);

        if(entityExists) {
          this.selectedThemeOption.data = selectedThemeData['data']; 
        } else {
          this.selectedThemeOption.data.deliverable = this.setEntityData(selectedData);
        }
      }
      else {
        this.selectedThemeOption.data.deliverable = this.setEntityData(selectedData);
      }
    }

    this.getTemplatesAndDeliverables();
    this.sharedService.setSelectedTheme(this.themingContext);

    setTimeout(function () {
      var industryButtons = document.querySelectorAll('.home-industry .btn');
      industryButtons.forEach(item => {
        item.classList.add('industry');
      });
    });
  }

  private setEntityData(selectedData) : DeliverablesInput {

    let selectedDeliverable = new DeliverablesInput();
    selectedDeliverable.id = selectedData.entityId;
    selectedDeliverable.templateId = selectedData.templateId;
    selectedDeliverable.templateName = selectedData.templateName;
    selectedDeliverable.deliverableName = selectedData.entityName;
    selectedDeliverable.projectId = this.projectDetails.projectId;
    return selectedDeliverable;

  }

  validateOriginalData(selectedThemeData: any) {
    return (selectedThemeData && selectedThemeData.hasOwnProperty('tempDelList') &&
      selectedThemeData.tempDelList.length && selectedThemeData.hasOwnProperty('data')
      && (selectedThemeData.data.template || selectedThemeData.data.deliverable));
  }
  // To get the template/deliverables in tree view structure
  getTemplatesAndDeliverables() {
    let subTemplates = [], tempDelList = [], subGroup = [], subGroupDeliverables = [];

    this.templateDeliverableList.templates.templatesDropDown.forEach(element => {
      if (this.selectedThemeOption.data.template && element.templateId == this.selectedThemeOption.data.template.templateId)
        subTemplates.push(new TreeviewItem({ checked: true, text: element.templateName, value: element.templateId }));
      else
        subTemplates.push(new TreeviewItem({ checked: false, text: element.templateName, value: element.templateId }));
    });
    this.templateDeliverableList.deliverables.deliverableResponse.forEach(element => {
      subGroupDeliverables=[];
      if (this.selectedThemeOption.data.deliverable) {
        let isGroupSelected = false;
        element.deliverables.forEach(x => {
          if (x.entityId == this.selectedThemeOption.data.deliverable.id) {
            isGroupSelected = true;
            subGroupDeliverables.push(new TreeviewItem({ checked: true, text: x.entityName, value: x.entityId }));
          }
          else
            subGroupDeliverables.push(new TreeviewItem({ checked: false, text: x.entityName, value: x.entityId }));

        });
        if (element.deliverables.length > 0) {
          if (isGroupSelected)
            subGroup.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId, children: subGroupDeliverables }));
          else
            subGroup.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId, children: subGroupDeliverables }));
        } else {
          if (element.entityId == this.selectedThemeOption.data.deliverable.id)
            subGroup.push(new TreeviewItem({ checked: true, text: element.entityName, value: element.entityId }));
          else
            subGroup.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId }));
        }
      }
      else {
        element.deliverables.forEach(x => {
          subGroupDeliverables.push(new TreeviewItem({ checked: false, text: x.entityName, value: x.entityId }));
        });
        if (element.deliverables.length > 0)
          subGroup.push(new TreeviewItem({ checked: true, text: element.entityName, value: element.entityId, children: subGroupDeliverables }));
        else
          subGroup.push(new TreeviewItem({ checked: false, text: element.entityName, value: element.entityId }));
      }

    });

    if (this.templateDeliverableList.templates.templatesDropDown.length > 0)
      tempDelList.push(new TreeviewItem({ checked: false, text: "Templates", value: "1", children: subTemplates }));
    if (this.templateDeliverableList.deliverables.deliverableResponse.length > 0)
      tempDelList.push(new TreeviewItem({ checked: false, text: "Deliverables", value: "2", children: subGroup }));
    this.selectedThemeOption.tempDelList = tempDelList;
    this.assignTreeList(this.section, this.selectedThemeOption.tempDelList);
  }

  onItemSelected3(item) {
    this.onItemSelected(item, this.section3TreeList, ThemeSection.Theme2_3)
  }

  onItemSelected(item, sectionTreeList, _theme) {
    var _selectedIds = [];
    var selectedTheme: any = [];
    this.designerService.clear(this.section);

    selectedTheme = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == _theme)[0];

    sectionTreeList.forEach(tree => {
      tree.internalChildren.forEach(element => {
        if (element.internalChildren) {
          element.internalChildren.forEach(subElement => {
            if (subElement.internalChecked == true && subElement.internalDisabled == false)
              _selectedIds.push(subElement.value);
          });
        } else {
          if (element.internalChecked == true && element.internalDisabled == false)
            _selectedIds.push(element.value);
        }
      });
    });
    this.updateThemingContext(_theme, sectionTreeList, _selectedIds);

    this.onDropDownItemSelection(selectedTheme, sectionTreeList)
  }

  updateThemingContext(section, tempDelList, _selectedIds) {
    var selectedTheme = this.sharedService.getSelectedTheme();
    var option = selectedTheme.themeOptions.filter(item => item.name == section)[0];
    option.tempDelList = tempDelList;
    var selectedData: any = {};

    if (_selectedIds.length == 0) option.data = new ThemeCollection();
    if (_selectedIds.length == 1) {
      option.data = new ThemeCollection();
      var data = this.templateDeliverableList.templates.templatesDropDown.filter(id => id.templateId == _selectedIds[0]);

      if (data && data.length == 0) {
        data = this.templateDeliverableList.deliverables.deliverableResponse.filter(id => id.entityId == _selectedIds[0]);
        if (data.length == 0) {
          this.templateDeliverableList.deliverables.deliverableResponse.forEach(child => {
            if (data.length == 0)
              data = child.deliverables.filter(id => id.entityId == _selectedIds[0]);
          });
        }
      }

      if (data && data.length > 0) {
        selectedData = data[0];

        if (selectedData.templateId && !selectedData.entityId) {
          option.data.template = new TemplateViewModel();
          option.data.template.templateId = selectedData.templateId;
          option.data.template.templateName = selectedData.templateName;
        }
        else if (selectedData.entityId) {
          option.data.deliverable = new DeliverablesInput();
          option.data.deliverable.id = selectedData.entityId;
          option.data.deliverable.templateId = selectedData.templateId;
          option.data.deliverable.templateName = selectedData.templateName;
          option.data.deliverable.deliverableName = selectedData.entityName;
          option.data.deliverable.projectId = this.projectDetails.projectId;
        }
      }
    }
    if(!option.data.deliverable && !option.data.template) {
      this._eventService.getEvent(this.section + "_" + eventConstantsEnum.projectDesigner.common.enableCreateBlock).publish(true);
    }
    this.sharedService.setSelectedTheme(selectedTheme);
    this.assignTreeList(section, tempDelList);
  }

  assignTreeList(section, tempDelList) {
    if (section == ThemeSection.Theme2_3)
      this.section3TreeList = tempDelList;
  }

  onDropDownItemSelection(selectedTheme, selectedTreeList) {
    var hasChange: boolean = false;

    selectedTreeList.forEach(item => {
      var selectedTree = selectedTheme.tempDelList.filter(id => id.value = item.value);
      if (selectedTree) {
        item.children.forEach(subItem => {
          selectedTree.forEach(subSelTree => {
            var subTree = subSelTree.internalChildren.filter(id => id.value == subItem.value && (id.internalChecked != subItem.checked || id.internalDisabled != subItem.disabled));
            if (subTree && subTree.length > 0)
              hasChange = true;
          })
        })
      }
    });

    if (hasChange) {
      this.subscriptions.add(this._eventService.getEvent(selectedTheme.name).publish(undefined));
      var payload: any = {};
      payload.selectedOption = selectedTheme.name;
      this.subscriptions.add(this._eventService.getEvent("theme2afterInitEvent").publish(payload));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.viewLoaded.next(true);

    if (this.section == ThemeSection.Theme2_3)
      this.subscriptions.add(this._eventService.getEvent("theme2afterInitEvent").publish(undefined));
  }

}
