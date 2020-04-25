import { Component, OnInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { EventConstants, eventConstantsEnum, IconViewSection } from '../../../../../../@models/common/eventConstants';
import { BlockService } from '../../../../services/block.service';
import { StorageService, StorageKeys } from '../../../../../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../../../../../@core/services/storage/sessionStorage.service';
import { ProjectDetails } from '../../../../../../@models/projectDesigner/region';
import { BlockRequest } from '../../../../../../@models/projectDesigner/block';
import { DesignerService } from '../../../../services/designer.service';
import { ShareDetailService } from '../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { Subscription } from 'rxjs';
import { Themes, Theme, ThemingContext, ThemeOptions, ThemeCollection } from '../../../../../../@models/projectDesigner/theming';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { NbDialogService } from '@nebular/theme';
import { ImportTemplateComponent } from '../../block-importer/import-template/import-template.component';
import { DesignerService as newDesigner } from '../../content/themes/services/designer.service';
import { UserUISetting } from '../../../../../../@models/user';
import { UserService } from '../../../../../user/user.service';
import { ProjectUserSettingModel } from '../../../../../../@models/project';
import { DefineColorsComponent } from '../../define-colors/define-colors.component';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-project-design-level2-menu',
  templateUrl: './project-design-level2-menu.component.html',
  styleUrls: ['./project-design-level2-menu.component.scss']
})

export class ProjectDesignLevel2MenuComponent implements OnInit {
  constructor(
    private readonly _eventService: EventAggregatorService,
    private el: ElementRef,
    private blockService: BlockService,
    private storageService: StorageService,
    private sessionStorageService: SessionStorageService,
    private designerService: DesignerService,
    private dialogService: DialogService,
    private _dialogService: NbDialogService,
    private sharedService: ShareDetailService,
    private translate: TranslateService,
    private newDesigner: newDesigner,
    private userservice: UserService,
    private router: Router
  ) {
    this.userUISetting = new UserUISetting();
  }


  itemsList = ITEMS;
  themesList = Themes;
  selectedMenu: any;
  public show: boolean = true;
  public imageName: string = this.translate.instant("collapse");
  checkedNumber = 3;
  limitNumber = 2;
  projectDetails: ProjectContext;
  disableCheckbox: boolean = false;
  subscriptions: Subscription = new Subscription();
  userUISetting: UserUISetting;
  isCentralUser: boolean;
  isExternalUser: boolean;
  isLocalUserHasTemplate: boolean;
  @ViewChild('uploader') uploader: any;

  themeData: any;

  getThemesList()
  {
    return Themes;
  }

  ngOnInit() {
    this.projectDetails = this.sharedService.getORganizationDetail();
    //this.themesList= this.getThemesList();

    this.userservice.getProjectUserSetting(this.projectDetails.projectId).subscribe((data: ProjectUserSettingModel) => {
      this.isCentralUser = data.isCentralUser;
      if (!this.isCentralUser && (this.designerService.docViewAccessRights && !this.designerService.docViewAccessRights.hasProjectTemplateAccess)) {
        this.isLocalUserHasTemplate = false;
      }
      else {
        this.isLocalUserHasTemplate = true;
      }
    });

    this.userservice.isExternalUser().subscribe((data: boolean) => {
      this.isExternalUser = data;
    }
    );

    this.subscriptions.add(this._eventService.getEvent("LoadSelectedTheme").subscribe((payload: any) => {
      this.loadSelectedTheme();
    }));

    this.userUISetting = this.userservice.getCurrentUserUISettings();

    if (!this.userUISetting.isMenuExpanded) {
      this.toggleCollapse();
    }
  }

  ngAfterViewInit() {
  }
  loadSelectedTheme() {
    this.themesList.forEach(item => item.checked = false);
    this.onThemeChange(null);
  }

  setThemeData(option, themingContext)
  {
    let themeName: string;
    if (themingContext && themingContext != null) {
      option = this.themesList.filter(item => item.name == themingContext.theme)[0];
      this.themeData = themingContext.themeOptions;
      themeName = themingContext.theme == "Theme1" ? EventConstants.DisplayTheme1 : themingContext.theme == "Theme2" ? EventConstants.DisplayTheme2 : EventConstants.DisplayTheme3;
    }
    else {
      option = this.themesList[0];
      themeName = EventConstants.DisplayTheme1;
      this.themeData = {};
      option.selectedDisplayType = this.itemsList[0];
    }
    return option;
  }

  refreshTheme()
  {
    this.loadSelectedTheme();
  }

  theme1CheckboxSelection(theme) {
    var checkedCount = theme.theme_options.filter(id => id.checked == true);
    this.checkedNumber = checkedCount.length;

    if (theme.value == Theme.Theme1 && theme.checked == true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme1).publish(theme));
    }
    if (theme.value == Theme.Theme2 && theme.checked == true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme2).publish(theme));
    }
    if (theme.value == Theme.Theme3 && theme.checked == true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme3).publish(theme));
    }
    if (theme.value == Theme.Theme4 && theme.checked == true) {
      this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme4).publish(theme));
    }
  }

  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.userUISetting.isMenuExpanded = true;
      this.imageName = this.translate.instant("collapse");
    }
    else {
      this.userUISetting.isMenuExpanded = false;
      this.imageName =this.translate.instant("expand");
    }
    this.userservice.updateCurrentUserUISettings(this.userUISetting);
  }

  enableDisableTheme(option) {
    const themeInContext = this.sharedService.getSelectedTheme();
    if(themeInContext && themeInContext.themeOptions.length <= 2) {
      if(option.name === themeInContext.theme) {
        option.theme_options.forEach((element, index) => {
            const selectedOption = themeInContext.themeOptions.find(item => item.name === element.value);
            element.checked = (selectedOption) ? true : false;
        }); 
        let checkedCount = option.theme_options.filter(item => item.checked == true);
        this.checkedNumber = checkedCount.length;
      } else {
        option.theme_options.forEach(item => item.checked = true);
      }
    } else {
      option.theme_options.forEach(item => item.checked = true);
    }
    this.themesList.forEach(item => {
      var element = document.getElementById(item.value.toString());

      if (item.value != option.value) {
        item.theme_options.forEach(subItem => subItem.checked = false);
        element.classList.add("disable-checkbox");
      }
      else
        element.classList.remove("disable-checkbox");
    });
  }

  onThemeChange(selectedOption) {
    this.themesList.forEach(item => item.checked = false);
    this.itemsList.forEach(item => item.checked == false);
    let themingContext = this.sharedService.getSelectedTheme();
    if(!themingContext) {
      if(this.designerService.selectedThemeInContext) {
        this.sharedService.setSelectedTheme(this.designerService.selectedThemeInContext);
        themingContext = this.designerService.selectedThemeInContext;
        this.designerService.selectedThemeInContext = '';
      }
    }
    let option = (selectedOption) ? selectedOption : this.setThemeData(selectedOption, themingContext);
    if(themingContext) {
      this.themeData = themingContext.themeOptions;
    }
    const selectedTypes = themingContext;
    const selectedTypeName = (selectedTypes) ? selectedTypes.selectedDisplayType.name : option.selectedDisplayType.name;
    const selectedType = (selectedTypes) ? selectedTypes.selectedDisplayType : option.selectedDisplayType;
    if(!option.selectedDisplayType) {
      option.selectedDisplayType = themingContext.selectedDisplayType;
    } else {
      if(selectedTypeName !== option.selectedDisplayType.name)
            option.selectedDisplayType = selectedType;
    }
    
    this.itemsList.forEach((items, index) => {
      items.checked = (items.name === option.selectedDisplayType.name) ? true : false;
    });
    option.checked = true;
    this.checkedNumber = 3;
    this.enableDisableTheme(option);

    switch (option.value) {
      case Theme.Theme1:
        this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
        this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme1).publish(option));
        break;
      case Theme.Theme2:
        this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
        this.setSelectedTheme(option);
        this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme2).publish(option));
        break;
      case Theme.Theme3:
        this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
        this.setSelectedTheme(option);
        this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme3).publish(option));
        break;
      case Theme.Theme4:
        this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
        this.setSelectedTheme(option);
        this.subscriptions.add(this._eventService.getEvent(EventConstants.DisplayTheme4).publish(option));
        break; 
    }
  }

  setSelectedTheme(option) {
    this.newDesigner.blockViewType = (option.selectedDisplayType) ? option.selectedDisplayType.value.toString() : "1"; // to do move to constant : block type 1 is to display name alone
    this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);

    let selectedTheme = new ThemingContext();
    selectedTheme.theme = option.name;

    //Check if previously any data for the chosen theme exists
    if(this.themeData && this.themeData.length && this.themeData.find(x=>x.name.indexOf(option.name)>-1))
    {
      selectedTheme.themeOptions = [];
      selectedTheme.themeOptions= this.themeData;
    }
    else
    {
      selectedTheme.themeOptions = [];
      option.theme_options.forEach(item => {
        let themOption = new ThemeOptions();
        themOption.name = item.value;
        selectedTheme.themeOptions.push(themOption);
      });
    }
    selectedTheme.selectedDisplayType = option.selectedDisplayType;
    this.sharedService.setSelectedTheme(selectedTheme);
  }

  onItemChange(item) {
    this.blockDispayTypes(item);
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockView).publish(item));
  }

  blockDispayTypes(selectedType) {
    let selectedBLocktype = this.sharedService.getSelectedTheme();
    selectedBLocktype.selectedDisplayType = selectedType;
    this.sharedService.setSelectedTheme(selectedBLocktype);
  }

  uploadFile(files) {
    this.designerService.selectedFileFormat = '';
    var ext = files[0].name.split('.').pop();
    if (ext == "pdf" || ext == "docx" || ext == "doc") {
      this.designerService.selectedFileFormat = ext;
      const formData = new FormData();
      formData.append('importingFile', files[0]);
      formData.append('projectId', this.projectDetails.projectId);
      var payload: any = {};
      
        payload.section = "BlockImporter";
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockExtendedView).publish(payload);

      this.blockService.importBlocksFromFile(formData)
        .subscribe((data: BlockRequest[]) => {

          var flatNodes: any = [];
          var index: number = 0;
          data.forEach(node => {
            var flatNode: any = {};
            flatNode.id = index++;
            node.id = flatNode.id;
            flatNode.item = node.title;
            flatNode.content = node.blockContent;
            flatNode.level = 0;
            flatNode.expandable = false;
            flatNodes.push(flatNode);
          });
          this.designerService.importedBlocks = data;
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockImporter.displayBlocks).publish(flatNodes);
        });
    }
    else {
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.appendix.messages.InvalidFileFormatMsg'));
    }
    this.uploader.nativeElement.value = '';
  }


  importLibraryTemplates() {
    const importTemplateRef = this._dialogService.open(ImportTemplateComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  librarySuggestBlocks() {
    var payload: any = {};
    payload.section = IconViewSection.LibraryBlockSuggestion;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.editBlockExtendedView).publish(payload);
  }

}
export const ITEMS = [
  {
    name: 'Name',
    value: '1',
    checked: true
  },
  {
    name: 'Name + Attributes',
    value: '2',
    checked: false
  },
  {
    name: 'Block Description',
    value: '3',
    checked: false
  }
];
