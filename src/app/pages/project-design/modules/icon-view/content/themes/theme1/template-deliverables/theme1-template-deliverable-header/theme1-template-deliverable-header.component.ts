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
import { DeliverablesInput } from '../../../../../../../../../@models/projectDesigner/deliverable';
import { DeliverableService } from '../../../../../../../services/deliverable.service';
import { DesignerService } from '../../../services/designer.service';
import { Designer } from '../../../../../../../../../@models/projectDesigner/designer';
import { TreeViewService } from '../../../../../../../../../shared/services/tree-view.service';
import { TreeViewConstant, eventConstantsEnum } from '../../../../../../../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-theme1-template-deliverable-header',
  templateUrl: './theme1-template-deliverable-header.component.html',
  styleUrls: ['./theme1-template-deliverable-header.component.scss'],
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
export class Theme1TemplateDeliverableHeaderComponent implements OnInit {

  projectDetails: ProjectContext;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  templateDeliverableList: any;
  themingContext: ThemingContext;
  selectedThemeOption: ThemeOptions;
  @Input("section") section: string;
  @Input("data") sectionData: [];

  selectedIds: any = [];
  subscriptions: Subscription = new Subscription();
  @Input("section2TreeList") section2TreeList = [];
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
    this.templateDeliverableList = this.designerService.templateDeliverableList;

    var otherThemes = this.themingContext.themeOptions.filter(item => item.name != this.section && item.name != ThemeSection.Theme1_1);

    otherThemes.forEach(item => {
      item.tempDelList.forEach(tree => {
        tree.internalChildren.forEach(subTree => {
          if (subTree.internalChildren) {
            subTree.internalChildren.forEach(subChildTree => {
              if (subChildTree.internalChecked == true && subChildTree.internalDisabled == false)
                this.selectedIds.push(subChildTree.value);
            });
          } else {
            if (subTree.internalChecked == true && subTree.internalDisabled == false)
              this.selectedIds.push(subTree.value);
          }
        })
      })
    });

    let selectedData;
    if (this.selectedIds.length == 0) {
      selectedData = this.templateDeliverableList.templates.templatesDropDown.length > 0 ? this.templateDeliverableList.templates.templatesDropDown.find(x => x.isDefault == true) : undefined;

      if (!selectedData) {
        var _items: any = [];
        if (this.templateDeliverableList.templates.templatesDropDown.length > 0)
          _items.push(this.templateDeliverableList.templates.templatesDropDown[0]);

        if (_items.length == 0)
          _items.push(this.templateDeliverableList.deliverables.deliverableResponse[0]);

        if (_items.length > 0)
          selectedData = _items[0];
      }
      this.selectedIds.push(selectedData.templateId);
    }
    else {
      let _items: any = [];
      //this condition is needed when i am in theme 1 for section 1.3 we are making deliverable as default
      if (this.section != ThemeSection.Theme1_3)
        _items = this.templateDeliverableList.templates.templatesDropDown.filter(x => !this.selectedIds.find(id => id == x.templateId));

        //If the logged in user does not have access to any template, pick based on entityId
        if(_items.length === 0 && this.section == ThemeSection.Theme1_2)
        {
          _items = this.templateDeliverableList.deliverables.deliverableResponse.filter(x => !this.selectedIds.find(id => id == x.entityId));
          
          if (_items.length > 0) {
            if (_items[0].deliverables.length > 0) {
              _items = _items[0].deliverables.filter(x => !this.selectedIds.find(id => id == x.entityId));;
            }
          }
        }

      if (_items.length == 0 && this.section == ThemeSection.Theme1_3) {
        _items = this.templateDeliverableList.deliverables.deliverableResponse.filter(x => !this.selectedIds.find(id => id == x.entityId));
        if (_items.length > 0) {
          if (_items[0].deliverables.length > 0) {
            _items = _items[0].deliverables.filter(x => !this.selectedIds.find(id => id == x.entityId));;
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
    if (selectedData && selectedData.templateId && !selectedData.entityId) {
      //$$$$ If previous data is available, then restore values from the original data
      //TODO: check for more properties
      if (this.validateOriginalData(selectedThemeData)) {
        //this.selectedThemeOption.data= selectedThemeData;
        this.selectedThemeOption.data = selectedThemeData['data'];
      }
      else {
        this.selectedThemeOption.data.template = new TemplateViewModel();
        this.selectedThemeOption.data.template.templateId = selectedData.templateId;
        this.selectedThemeOption.data.template.templateName = selectedData.templateName;
      }
    }
    //TODO: carry out similar check like template $$$$ 
    else if (selectedData && selectedData.entityId) {
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

    if (this.templateDeliverableList.deliverables.deliverableResponse.length > 0) {
      let deliverables = new TreeviewItem({ checked: false, text: "Deliverables", value: "2", children: subGroup });
      tempDelList.push(deliverables);
    }

    this.selectedThemeOption.tempDelList = tempDelList;
    this.assignTreeList(this.section, this.selectedThemeOption.tempDelList);
  }

  onItemSelected2(item) {
    this.onItemSelected(item, this.section2TreeList, ThemeSection.Theme1_2);
    //set entityid when selecting multiple deliverables
    this.setEntityId(ThemeSection.Theme1_2, this.section3TreeList);
  }

  onItemSelected3(item) {
    this.onItemSelected(item, this.section3TreeList, ThemeSection.Theme1_3);
    //set entityid when selecting multiple deliverables
    this.setEntityId(ThemeSection.Theme1_3, this.section3TreeList);
  }

  setEntityId(_section, sectionTreeList) {
    var entitiyIds: any = [];
    var _sectionTreeList = sectionTreeList.filter(item => item.text == "Deliverables");
    _sectionTreeList.forEach(tree => {
      tree.internalChildren.forEach(element => {
        if (element.internalChildren) {
          element.internalChildren.forEach(subElement => {
            if (subElement.internalChecked == true && subElement.internalDisabled == false)
              entitiyIds.push(subElement.value);
          });
        } else {
          if (element.internalChecked == true && element.internalDisabled == false)
            entitiyIds.push(element.value);
        }
      });
    });

    var section = this.designerService.themeOptions.filter(item => item.name == _section)[0];

    if (section && section.designerService)
      section.designerService.selectedEntityIds = entitiyIds;
  }

  onItemSelected(item, sectionTreeList, _theme) {
    var _selectedIds = [];
    var selectedTheme: any = [];

    this.designerService.clear(this.section);
    //if (item.length > 1)
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

    //if (item.length > 1) {
    this.onDropDownItemSelection(selectedTheme, sectionTreeList)
    //}
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
          option.data.deliverable.projectId = this.projectDetails.projectId;
          option.data.deliverable.deliverableName = selectedData.entityName;
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
    if (section == ThemeSection.Theme1_2)
      this.section2TreeList = tempDelList;
    if (section == ThemeSection.Theme1_3)
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
      var payload: any = {};
      payload.selectedOption = selectedTheme.name;
      this._eventService.getEvent(selectedTheme.name).publish(undefined);
      this._eventService.getEvent("theme1afterInitEvent").publish(payload);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.viewLoaded.next(true);

    if (this.section == ThemeSection.Theme1_3)
      this.subscriptions.add(this._eventService.getEvent("theme1afterInitEvent").publish(undefined));
  }

}
