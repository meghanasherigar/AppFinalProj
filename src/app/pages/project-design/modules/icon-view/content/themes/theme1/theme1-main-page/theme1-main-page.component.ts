import { Component, OnInit } from '@angular/core';
import { ProjectUserRightViewModel, ProjectDeliverableRightViewModel, UserRightsViewModel } from '../../../../../../../../@models/userAdmin';
import { ThemeSection, SelectedSection } from '../../../../../../../../@models/projectDesigner/theming';
import { Subscription } from 'rxjs';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { LibraryService } from '../../../../../../../admin/services/library.service';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { DesignerService } from '../../services/designer.service';
import { TemplateService } from '../../../../../../services/template.service';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { ThemeService } from '../../common/theme.service';
import { LibraryDropdownViewModel } from '../../../../../../../../@models/projectDesigner/library';
import { EventConstants, IconViewSection, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { TemplateDetailsRequestModel, TemplateDeliverableViewModel, TemplateAndBlockDetails, TemplateViewModel } from '../../../../../../../../@models/projectDesigner/template';
import { TreeviewItem } from 'ngx-treeview';
import { DeliverableResponseViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { BlockDetailsResponseViewModel, TemplateBlockDetails } from '../../../../../../../../@models/projectDesigner/block';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { DesignerService as oldDesigner } from '../../../../../../services/designer.service';
import { BlockService } from '../../../../../../services/block.service';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';

@Component({
  selector: 'ngx-theme1-main-page',
  templateUrl: './theme1-main-page.component.html',
  styleUrls: ['./theme1-main-page.component.scss']
})
export class Theme1MainPageComponent implements OnInit {
  selectedSection1: string = "";
  selectedSection2: string = "";
  selectedSection3: string = "";
  isDisplay1_1: boolean = false;
  isDisplay1_2: boolean = false;
  isDisplay1_3: boolean = false;
  projectId: string = "";
  projectUserRightsData: ProjectDeliverableRightViewModel;
  subscriptions: Subscription = new Subscription();
  sectionData: any = [];
  displaySectionB: boolean = false;
  displaySectionC: boolean = false;
  displaySectionA: boolean = false;
  section1 = ThemeSection.Theme1_1;
  section2 = ThemeSection.Theme1_2;
  section3 = ThemeSection.Theme1_3;
  selectedLibrary1: any;
  projectDetails: ProjectContext;
  section2TreeList = [];
  section3TreeList = [];
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  loaderId = 'Theme1Loader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  templateTreeItemValue: string = "1";

  constructor(private libraryService: LibraryService, private _eventService: EventAggregatorService, private sharedService: ShareDetailService,
    private projectUserService: ProjectUserService, private designerService: DesignerService,
    private templateService: TemplateService, private deliverableService: DeliverableService, private themeService: ThemeService,
    private ngxLoader: NgxUiLoaderService, private oldDesignerService: oldDesigner,
    private blockService: BlockService) { }

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);

    this.projectDetails = this.sharedService.getORganizationDetail();
    this.projectUserService.getProjectUserRights(this.projectDetails.projectId).subscribe((rolesData: ProjectDeliverableRightViewModel) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);

      if (rolesData) {
        this.designerService.projectUserRightsData = this.projectUserRightsData = rolesData;
        this.loadLibrarySection();
      }
    });

    this.subscriptions.add(this._eventService.getEvent(this.section1).subscribe((payload: any) => {
      if (payload.section == ThemeSection.Theme1_1)
        this.selectedSection1 = payload.selectedSection;
      this.selectedLibrary1 = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name == payload.section)[0].library.name;
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section2).subscribe((payload: any) => {
      this.setThemeOptions(ThemeSection.Theme1_2);
    }));

    this.subscriptions.add(this._eventService.getEvent(this.section3).subscribe((payload: any) => {
      this.setThemeOptions(ThemeSection.Theme1_3);
    }));

    this.subscriptions.add(this._eventService.getEvent("theme1afterInitEvent").subscribe((payload: any) => {
      var treeItem = [];
      var themeOptions: any = this.sharedService.getSelectedTheme().themeOptions;

      if (themeOptions.length == 3) {
        this.themeService.allThemeOptions = themeOptions;
      }

      if (payload && payload.selectedOption)
        themeOptions = this.sharedService.getSelectedTheme().themeOptions.filter(id => id.name == payload.selectedOption);
      if (payload && payload.excludedOption)
        themeOptions = this.sharedService.getSelectedTheme().themeOptions.filter(id => id.name != payload.excludedOption);

      var _themeOptions = themeOptions.filter(item => item.name != ThemeSection.Theme1_1);

      let selectedThemeOptions = this.sharedService.getSelectedTheme();
      if (selectedThemeOptions && selectedThemeOptions.themeOptions.length > 0) {
        let selectedOption1 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme1_1);
        let selectedOption2 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme1_2);
        let selectedOption3 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme1_3);
        this.isDisplay1_1 = (!selectedOption1) ? false : true;
        this.isDisplay1_2 = (!selectedOption2) ? false : true;
        this.isDisplay1_3 = (!selectedOption3) ? false : true;
      }

      _themeOptions.forEach(selectedItem => {

        if (selectedItem.data) {
          if (selectedItem.data.template && selectedItem.data.template.templateId) {
            if (selectedItem.name == ThemeSection.Theme1_2)
              this.selectedSection2 = SelectedSection.Templates;
            else if (selectedItem.name == ThemeSection.Theme1_3)
              this.selectedSection3 = SelectedSection.Templates;

            this.ngxLoader.startBackgroundLoader('TemplateLoader_' + selectedItem.name);
            //Check for any previously saved filter for the chosen template
            let templateFilter = this.designerService.CheckIfFilterExsists(selectedItem.name, selectedItem.data.template.templateId);
            if (templateFilter && (templateFilter.stackFilter || templateFilter.blockFilterData)) {
              this.blockService.blockSelectedFilter(templateFilter).subscribe((response: any) => {
                let payload = new TemplateAndBlockDetails();
                payload.blocks = response;
                payload.template = selectedItem.data.template;
                payload.filterApplied = true;
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_loadTemplateFilterContent").publish(payload));

                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_" +
                  eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true)));
              });
            }
            else {

              this.templateService.getTemplateBlocksByTemplateId(selectedItem.data.template.templateId).subscribe((data: TemplateBlockDetails) => {
                selectedItem.data.blocks = data.blocks;
                var payload: any = {};
                payload.filterApplied = false;
                payload.blocks = data.blocks;
                payload.template = data.template;
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_loadTemplateContent").publish(payload));
                //reset filter applied as the content component does not reload on drop down change
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_templateFilterApplied").publish(false));
              });
            }
          }
          else if (selectedItem.data.deliverable && selectedItem.data.deliverable.id) {
            var deliverableInput: any = {};
            deliverableInput = selectedItem.data.deliverable;
            if (selectedItem.name == ThemeSection.Theme1_2)
              this.selectedSection2 = SelectedSection.Deliverables;
            else if (selectedItem.name == ThemeSection.Theme1_3)
              this.selectedSection3 = SelectedSection.Deliverables;
            let deliverableFilter = this.designerService.CheckIfDeliverableFilterExsists(selectedItem.name, selectedItem.data.deliverable.id);
            this.ngxLoader.startBackgroundLoader('DeliverableLoader_' + selectedItem.name);

            if (deliverableFilter && (deliverableFilter.stackFilter || deliverableFilter.blockFilterData)) {
              this.blockService.DeliverableSelectedFilter(deliverableFilter).subscribe((response: any) => {
                let payload = new TemplateAndBlockDetails();
                payload.blocks = response;
                payload.filterApplied = true;
                this._eventService.getEvent(selectedItem.name + "_loadDeliverableFilterContent").publish(payload);
                this._eventService.getEvent(selectedItem.name + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((true));
              });
            } else {
              this.deliverableService.getDeliverable(deliverableInput).subscribe((data: DeliverableResponseViewModel) => {
                data.templateName = deliverableInput.templateName;
                data['filterApplied'] = false;
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_loadDeliverableContent").publish(data));
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.filterIcon).publish((false)));
              });

            }

          }
          else {
            this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_loadEmptyContent").publish(true));
          }
        }
        treeItem = selectedItem.tempDelList;
        this.enableDisableItems(selectedItem.name, treeItem);
      });
    }));

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme4).subscribe((payload: any) => {
      this.isDisplay1_1 = this.isDisplay1_2 = this.isDisplay1_3 = false;
      payload.theme_options.forEach(item => {
        if (item.value == "Theme1.1" && item.checked == true) {
          this.isDisplay1_1 = true;
          //$$$$$- Added to reload library section
          this._eventService.getEvent(ThemeSection.Theme1_1 + "_" + eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary)
            .publish('');
        }
        if (item.value == "Theme1.2" && item.checked == true) {
          this.isDisplay1_2 = true;
        }
        if (item.value == "Theme1.3" && item.checked == true) {
          this.isDisplay1_3 = true;
        }
      });

      var _data: any = {};
      _data.excludedOption = undefined;

      if (!this.isDisplay1_1) _data.excludedOption = ThemeSection.Theme1_1;
      if (!this.isDisplay1_2) _data.excludedOption = ThemeSection.Theme1_2;
      if (!this.isDisplay1_3) _data.excludedOption = ThemeSection.Theme1_3;
      if (_data.excludedOption) this.updateThemeOptions(_data.excludedOption);
      var theme = this.sharedService.getSelectedTheme();

      if (!_data.excludedOption && theme.themeOptions.length < 3) {
        theme.themeOptions = this.themeService.allThemeOptions;
        this.sharedService.setSelectedTheme(theme);
      }
      this.subscriptions.add(this._eventService.getEvent("theme1afterInitEvent").publish(_data));
    }));
  }

  updateThemeOptions(section) {
    var theme = this.sharedService.getSelectedTheme();
    var _filteredTheme = theme.themeOptions.filter(id => id.name != section);
    theme.themeOptions = _filteredTheme;
    this.sharedService.setSelectedTheme(theme);
  }

  setThemeOptions(section) {
    var treeItem = [];
    var allThemeOptions = this.sharedService.getSelectedTheme().themeOptions;
    var themeOptions = allThemeOptions.filter(item => item.name != section);
    themeOptions.forEach(option => {
      var selectedItem = allThemeOptions.filter(item => item.name == option.name)[0];
      if (selectedItem.tempDelList && selectedItem.tempDelList.length > 0) {
        treeItem = selectedItem.tempDelList;
        this.enableDisableItems(option.name, treeItem);
      }
    })
  }

  enableDisableItems(section, treeItem) {
    let tempDelList = [], _selectedIds = [], otherItemselectedIds = [], subGroup = [];

    treeItem.forEach(tree => {
      if (tree.value == this.templateTreeItemValue) {
        tree.internalChildren.forEach(element => {
          if (element.internalChecked == true && element.internalDisabled == false)
            _selectedIds.push(element.value);
        });
        tempDelList.push(new TreeviewItem({ checked: false, text: tree.text, value: tree.value, children: tree.internalChildren }));
      } else {
        tree.internalChildren.forEach(element => {

          if (element.internalChildren != undefined) {
            element.internalChildren.forEach(subElement => {
              if (subElement.internalChecked == true && subElement.internalDisabled == false) {
                _selectedIds.push(subElement.value);
                // if (_selectedIds.filter(id => id == element.value).length == 0)
                //   _selectedIds.push(element.value);
              }

            });
            subGroup.push(new TreeviewItem({ checked: false, text: element.text, value: element.value, children: element.internalChildren }));
          } else {
            if (element.internalChecked == true && element.internalDisabled == false)
              _selectedIds.push(element.value);
            subGroup.push(new TreeviewItem({ checked: false, text: element.text, value: element.value }));
          }

        });
        tempDelList.push(new TreeviewItem({ checked: false, text: tree.text, value: tree.value, children: subGroup }));
      }
    });

    var otherThemes = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name != section && item.name != ThemeSection.Theme1_1);

    otherThemes.forEach(item => {
      item.tempDelList.forEach(tree => {
        tree.internalChildren.forEach(subTree => {
          if (subTree.internalChildren) {
            subTree.internalChildren.forEach(subGroup => {
              if (subGroup.internalChecked == true && subGroup.internalDisabled == false)
                otherItemselectedIds.push(subGroup.value);
            })
          } else {
            if (subTree.internalChecked == true && subTree.internalDisabled == false)
              otherItemselectedIds.push(subTree.value);
          }
        })
      })
    });

    let otherSubChild = 0, subChild = 0;
    tempDelList.forEach(item => {
      item.children.forEach(children => {
        if (children.internalChildren) {
          children.internalChildren.forEach(subChildren => {
            if (otherItemselectedIds.find(id => id == subChildren.value)) {
              otherSubChild++;
              subChildren.internalChecked = true;
              subChildren.internalDisabled = true;
            } else if (_selectedIds.find(id => id == subChildren.value)) {
              subChildren.internalChecked = true;
              subChild++;
            }
            else {
              subChildren.internalChecked = false;
              subChildren.internalDisabled = true;
            }
          });

        }
      });
    });

    tempDelList.forEach(item => {
      item.children.forEach(children => {
        if (otherItemselectedIds.find(id => id == children.value)) {
          children.internalChecked = true;
          children.internalDisabled = true;
        }
        else if (_selectedIds.find(id => id == children.value)) {
          children.internalChecked = true;
        }
        else {
          children.internalChecked = false;
          children.internalDisabled = true;
        }
        if (children.internalChildren) {
          if (children.internalChildren.length == subChild) {
            children.internalChecked = true;
            children.internalDisabled = false;
          }
          if (children.internalChildren.length == otherSubChild) {
            children.internalChecked = true;
            children.internalDisabled = true;
          }
        }
      });

    });
    //section to select only template / deliverable and disable the other one. -- starts
    this.themeService.enableDisableTemplatedDeliverable(tempDelList);
    //section to select only template / deliverable and disable the other one. -- ends
    tempDelList.forEach(item => {
      if (item.children.filter(x => x.internalChecked == false).length > 0)
        item.internalChecked = false;
      else
        item.internalChecked = true;

      // if (item.children.filter(x => x.internalDisabled == false).length > 0)
      //   item.internalDisabled = false;
      // else
      //   item.internalDisabled = true;
    });
    var selectedTheme = this.sharedService.getSelectedTheme();
    var option = selectedTheme.themeOptions.filter(item => item.name == section)[0];
    option.tempDelList = tempDelList;
    this.sharedService.setSelectedTheme(selectedTheme);


    if (section == ThemeSection.Theme1_2)
      this.section2TreeList = tempDelList;
    if (section == ThemeSection.Theme1_3)
      this.section3TreeList = tempDelList;

    setTimeout(function () {
      //to do
      let element: HTMLElement = document.getElementById(section);
      if (element) {
        for (var i = 0; i < element.getElementsByClassName("form-check").length; i++) {
          var content = option.data.template ? option.data.template.templateName : (option.data.deliverable ? option.data.deliverable.deliverableName : '');
          if (content != '' && element.getElementsByClassName("form-check")[i].textContent.trim() == content)
            element.getElementsByClassName("form-check")[i].classList.add("selected-temp-del");
        }
      }
    });
  }


  loadLibrarySection() {
    this.libraryService.getlibrarytypes().subscribe((data: LibraryDropdownViewModel[]) => {
      if (this.projectUserRightsData && this.projectUserRightsData.isExternalUser == false) {
        this.sectionData = data;
      }
      else if (this.projectUserRightsData && this.projectUserRightsData.isExternalUser == true) {
        this.sectionData = data.filter(id => id.name != EventConstants.Global && id.name != EventConstants.Country);
      }
      let index = 0;
      this.sectionData.forEach(item => {
        item.checked = false;
        item.disabled = false;
        item.index = index;
        index++;
      });
      this.isDisplay1_1 = true;
      this.displaySectionA = true;
      this.designerService.libraryList = this.sectionData;
    });
  }

  getTemplateDeliverables() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.templateDetailsRequestModel.projectId = this.projectDetails.projectId;

    this.templateService.getTemplateDeliverables(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.displaySectionB = true;
      this.isDisplay1_2 = true;
      this.sectionData = data;
      this.designerService.templateDeliverableList = this.sectionData;
      this.oldDesignerService.templateDeliverableList = this.sectionData;
      this.sectionData.deliverables.deliverableResponse.forEach(ele => {
        ele.deliverables.forEach(subele => {
          subele.entityName = subele.entityName + ' ' + moment(subele.taxableYearEnd).local().format("DD MMM YYYY");
        });
        if (ele.deliverables.length == 0) ele.entityName = ele.entityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
    });
  }

  compLoaded(section) {
    var _parentThis = this;
    setTimeout(function () {
      if (section == _parentThis.section1) {
        _parentThis.getTemplateDeliverables();
      }
      if (section == _parentThis.section2) {
        _parentThis.displaySectionC = true;
        _parentThis.isDisplay1_3 = true;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
