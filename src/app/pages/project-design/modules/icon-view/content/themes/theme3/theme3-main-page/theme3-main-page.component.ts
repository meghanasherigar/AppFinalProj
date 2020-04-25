import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { ThemingContext, ThemeSection, ThemeOptions, Theme, ThemeCollection, SelectedSection } from '../../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { TreeviewItem } from 'ngx-treeview';
import { ThemeService } from '../../common/theme.service';
import { StorageService, StorageKeys } from '../../../../../../../../@core/services/storage/storage.service';
import { TemplateDeliverableViewModel, TemplateDetailsRequestModel, TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../../@models/projectDesigner/template';
import { ProjectContext } from '../../../../../../../../@models/organization';
import { TemplateService } from '../../../../../../services/template.service';
import { forEach } from '@angular/router/src/utils/collection';
import { EventConstants, eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { BlockDetailsResponseViewModel, TemplateBlockDetails } from '../../../../../../../../@models/projectDesigner/block';
import { DeliverableService } from '../../../../../../services/deliverable.service';
import { DeliverableResponseViewModel } from '../../../../../../../../@models/projectDesigner/deliverable';
import { DesignerService } from '../../services/designer.service';
import { ProjectUserService } from '../../../../../../../admin/services/project-user.service';
import { ProjectDeliverableRightViewModel, UserRightsViewModel } from '../../../../../../../../@models/userAdmin';
import * as moment from 'moment';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';
import { DesignerService as oldDesigner } from '../../../../../../services/designer.service';
import { BlockService } from '../../../../../../services/block.service';
import { Designer } from '../../../../../../../../@models/projectDesigner/designer';

@Component({
  selector: 'ngx-theme3-main-page',
  templateUrl: './theme3-main-page.component.html',
  styleUrls: ['./theme3-main-page.component.scss']
})
export class Theme3MainPageComponent implements OnInit, OnDestroy {

  loaderId = 'Theme3Loader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';


  constructor(private readonly _eventService: EventAggregatorService, private sharedService: ShareDetailService, private themeService: ThemeService, private templateService: TemplateService,
    private deliverableService: DeliverableService, private designerService: DesignerService, private projectUserService: ProjectUserService, private ngxLoader: NgxUiLoaderService, private oldDesignerService: oldDesigner,
    private blockService: BlockService) { }
  subscriptions: Subscription = new Subscription();
  themingContext: ThemingContext;
  projectDetails: ProjectContext;
  templateDetailsRequestModel = new TemplateDetailsRequestModel();
  section1 = ThemeSection.Theme3_1;
  section2 = ThemeSection.Theme3_2;
  section3 = ThemeSection.Theme3_3;
  sectionData: any = [];
  section1TreeList = [];
  section2TreeList = [];
  section3TreeList = [];
  displaySectionB: boolean = false;
  displaySectionC: boolean = false;
  displaySectionA: boolean = false;
  isDisplay3_1: boolean = false;
  isDisplay3_2: boolean = false;
  isDisplay3_3: boolean = false;
  selectedSection1: string = "";
  selectedSection2: string = "";
  selectedSection3: string = "";
  templateTreeItemValue: string = "1";

  ngOnInit() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    // To get the access rights and roles per user
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.projectUserService.getProjectUserRights(this.projectDetails.projectId).subscribe((rolesData: ProjectDeliverableRightViewModel) => {
      if (rolesData) {
        this.designerService.projectUserRightsData = rolesData;
        this.getTemplateDeliverables();
      }
    });

    this.subscriptions.add(this._eventService.getEvent(this.section1).subscribe((payload: any) => {
      this.setThemeOptions(ThemeSection.Theme3_1);
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section2).subscribe((payload: any) => {
      this.setThemeOptions(ThemeSection.Theme3_2);
    }));
    this.subscriptions.add(this._eventService.getEvent(this.section3).subscribe((payload: any) => {
      this.setThemeOptions(ThemeSection.Theme3_3);
    }));
    this.subscriptions.add(this._eventService.getEvent("afterInitEvent").subscribe((payload: any) => {
      this.ngxLoader.stopBackgroundLoader(this.loaderId);

      var treeItem = [];
      var themeOptions: any = this.sharedService.getSelectedTheme().themeOptions;

      if (themeOptions.length == 3) {
        this.themeService.allThemeOptions = themeOptions;
      }

      if (payload && payload.selectedOption)
        themeOptions = this.sharedService.getSelectedTheme().themeOptions.filter(id => id.name == payload.selectedOption);
      if (payload && payload.excludedOption)
        themeOptions = this.sharedService.getSelectedTheme().themeOptions.filter(id => id.name != payload.excludedOption);

      let selectedThemeOptions = this.sharedService.getSelectedTheme();
      if (selectedThemeOptions && selectedThemeOptions.themeOptions.length > 0) {
        let selectedOption1 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme3_1);
        let selectedOption2 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme3_2);
        let selectedOption3 = selectedThemeOptions.themeOptions.find(selectedTheme => selectedTheme.name === ThemeSection.Theme3_3);
        this.isDisplay3_1 = (!selectedOption1) ? false : true;
        this.isDisplay3_2 = (!selectedOption2) ? false : true;
        this.isDisplay3_3 = (!selectedOption3) ? false : true;
      }

      themeOptions.forEach(selectedItem => {

        if (selectedItem.data) {
          if (selectedItem.data.template && selectedItem.data.template.templateId) {
            if (selectedItem.name == ThemeSection.Theme3_1)
              this.selectedSection1 = SelectedSection.Templates;
            else if (selectedItem.name == ThemeSection.Theme3_2)
              this.selectedSection2 = SelectedSection.Templates;
            else if (selectedItem.name == ThemeSection.Theme3_3)
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
                selectedItem.data.template = data.template;
                payload.template = selectedItem.data.template;
                this.subscriptions.add(this._eventService.getEvent(selectedItem.name + "_loadTemplateContent").publish(payload));
              });
            }
          }
          else if (selectedItem.data.deliverable && selectedItem.data.deliverable.id) {
            var deliverableInput: any = {};
            deliverableInput = selectedItem.data.deliverable;
            if (selectedItem.name == ThemeSection.Theme3_1)
              this.selectedSection1 = SelectedSection.Deliverables;
            else if (selectedItem.name == ThemeSection.Theme3_2)
              this.selectedSection2 = SelectedSection.Deliverables;
            else if (selectedItem.name == ThemeSection.Theme3_3)
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

    this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme3).subscribe((payload: any) => {
      this.isDisplay3_1 = this.isDisplay3_2 = this.isDisplay3_3 = false;
      payload.theme_options.forEach(item => {
        if (item.value == "Theme3.1" && item.checked == true) {
          this.isDisplay3_1 = true;
        }
        if (item.value == "Theme3.2" && item.checked == true) {
          this.isDisplay3_2 = true;
        }
        if (item.value == "Theme3.3" && item.checked == true) {
          this.isDisplay3_3 = true;
        }
      });

      var _data: any = {};
      _data.excludedOption = undefined;

      if (!this.isDisplay3_1) _data.excludedOption = ThemeSection.Theme3_1;
      if (!this.isDisplay3_2) _data.excludedOption = ThemeSection.Theme3_2;
      if (!this.isDisplay3_3) _data.excludedOption = ThemeSection.Theme3_3;
      if (_data.excludedOption) this.updateThemeOptions(_data.excludedOption);
      var theme = this.sharedService.getSelectedTheme();

      if (!_data.excludedOption && theme.themeOptions.length < 3) {
        theme.themeOptions = this.themeService.allThemeOptions;
        this.sharedService.setSelectedTheme(theme);
      }

      this.subscriptions.add(this._eventService.getEvent("afterInitEvent").publish(_data));
    }));
  }

  updateThemeOptions(section) {
    var theme = this.sharedService.getSelectedTheme();
    var _filteredTheme = theme.themeOptions.filter(id => id.name != section);
    theme.themeOptions = _filteredTheme;
    this.sharedService.setSelectedTheme(theme);
  }

  getTemplateDeliverables() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    this.templateDetailsRequestModel.projectId = this.projectDetails.projectId;

    this.templateService.getTemplateDeliverables(this.templateDetailsRequestModel).subscribe((data: TemplateDeliverableViewModel[]) => {
      this.sectionData = data;
      this.isDisplay3_1 = true;
      this.displaySectionA = true;
      this.sectionData.deliverables.deliverableResponse.forEach(ele => {
        ele.deliverables.forEach(subele => {
          subele.entityName = subele.entityName + ' ' + moment(subele.taxableYearEnd).local().format("DD MMM YYYY");
        });
        if (ele.deliverables.length == 0) ele.entityName = ele.entityName + ' ' + moment(ele.taxableYearEnd).local().format("DD MMM YYYY");
      });
    });
  }

  setThemeOptions(section) {
      var treeItem = [];
      var allThemeOptions = this.sharedService.getSelectedTheme().themeOptions;
      var themeOptions = allThemeOptions.filter(item => item.name != section);
      themeOptions.forEach(option => {
        var selectedItem = allThemeOptions.filter(item => item.name == option.name)[0];
        treeItem = selectedItem.tempDelList;
        this.enableDisableItems(option.name, treeItem);
      })
    }

  enableDisableItems(section, treeItem) {
      let tempDelList =[], _selectedIds =[], otherItemselectedIds =[], subGroup =[];

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

      var otherThemes = this.sharedService.getSelectedTheme().themeOptions.filter(item => item.name != section);

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


      if(section == ThemeSection.Theme3_1)
    this.section1TreeList = tempDelList;
    if (section == ThemeSection.Theme3_2)
      this.section2TreeList = tempDelList;
    if (section == ThemeSection.Theme3_3)
      this.section3TreeList = tempDelList;

    setTimeout(function () {
      //to do
      var element: HTMLElement = document.getElementById(section);
      for (var i = 0; i < element.getElementsByClassName("form-check").length; i++) {
        var content = option.data.template ? option.data.template.templateName : (option.data.deliverable ? option.data.deliverable.deliverableName : '');
        if (content != '' && element.getElementsByClassName("form-check")[i].textContent.trim() == content)
          element.getElementsByClassName("form-check")[i].classList.add("selected-temp-del");
      }
    });
  }


  compLoaded(section) {
    var _parentThis = this;
    setTimeout(function () {
      if (section == _parentThis.section1) {
        _parentThis.displaySectionB = true;
        _parentThis.isDisplay3_2 = true;
      }
      if (section == _parentThis.section2) {
        _parentThis.displaySectionC = true;
        _parentThis.isDisplay3_3 = true;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
