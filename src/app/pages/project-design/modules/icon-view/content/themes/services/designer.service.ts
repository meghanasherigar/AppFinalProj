import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ThemeOptions } from '../../../../../../../@models/projectDesigner/theming';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { Designer } from '../../../../../../../@models/projectDesigner/designer';
import { ProjectDeliverableRightViewModel, DeliverableRoleViewModel } from '../../../../../../../@models/userAdmin';
import { BlockFilterRequestDataModel, StackModelFilter, BlockFilterDataModel, DeliverableRequestViewModel } from '../../../../../../../@models/projectDesigner/block';


@Injectable({
    providedIn: 'root'
})


export class DesignerService {
    themeOptions: ThemeOptions[];
    designer: Designer;

    isDoubleClicked = new BehaviorSubject<boolean>(false);
    currentDoubleClicked = this.isDoubleClicked.asObservable();
    isDocFullViewEnabled = new BehaviorSubject<boolean>(false);
    currentDocViewEnabled = this.isDocFullViewEnabled.asObservable();
    projectUserRightsData: ProjectDeliverableRightViewModel;
    selectedEntityRights: any;
    libraryList: any = [];
    templateDeliverableList: any = [];
    blockViewType: string;
    appendixBlocks: any;
    appendixBlockExists: boolean;
    pushBack:boolean= false;
    constructor(private sharedService: ShareDetailService) {
    }

    public setDesignerService() {
        this.themeOptions = this.sharedService.getSelectedTheme().themeOptions;
    }

    clear(section) {
        if (this.themeOptions) {
            var selectedSection = this.themeOptions.filter(item => item.name == section);
            if (selectedSection.length > 0) {
                var designerService = selectedSection[0].designerService;
                designerService.blockDetails = null;
                designerService.blockAttributeDetail = null;
                designerService.stackAttributeDetail = null;
                designerService.blockList = [];
                designerService.assignToBlockList = [];
            }
        }
    }

    filterData(section) {
        var designerService = this.themeOptions.filter(item => item.name == section)[0].designerService;

        designerService.selectedFilterProjectYear = [];
        designerService.selectedFilterblockStatus = [];
        designerService.selectedFilterblockOrigin = [];
        designerService.selectedFiltertitle = [];
        designerService.selectedFilterBlockCreator = [];
        designerService.selectedFilterblockState = [];
        designerService.selectedFilterindustry = [];
        designerService.selectedblockType = [];



    }
    changeIsDoubleClicked(section, isDoubleClicked: boolean) {
        this.isDoubleClicked.next(isDoubleClicked);
    }
    changeIsDocFullView(section, updatedValue: boolean) {
        this.isDocFullViewEnabled.next(updatedValue);
    }

    CheckIfFilterExsists(section, templateId) {
        let themingContext = this.sharedService.getSelectedTheme();
        let currentDesignerService = themingContext.themeOptions.find(x => x.name == section).designerService;
        let templateBlockFilter = new BlockFilterRequestDataModel();
        templateBlockFilter.stackFilter = null;
        templateBlockFilter.blockFilterData = null;

        if (currentDesignerService.templateDetails &&
            currentDesignerService.templateDetails.templateId === templateId) {

            //TODO: check if all the filter arrays are checked
            if (currentDesignerService.selectedFilterProjectYear.length > 0
                || currentDesignerService.selectedFilterBlockCreator.length > 0
                || currentDesignerService.selectedFilterblockOrigin.length > 0
                || currentDesignerService.selectedFilterblockState.length > 0
                || currentDesignerService.selectedFilterblockStatus.length > 0
                || currentDesignerService.selectedFilterindustry.length > 0
                || currentDesignerService.selectedFilterDescription.length > 0
                || currentDesignerService.selectedStackLevel.length > 0
                || currentDesignerService.selectedFiltertitle.length > 0
                || currentDesignerService.selectedStackType.length > 0
                || currentDesignerService.selectedblockType.length > 0) {

                if (currentDesignerService.selectedStackType.length > 0 ||
                    currentDesignerService.selectedStackLevel.length > 0 ||
                    currentDesignerService.selectedStackTransactionType.length > 0) {
                    templateBlockFilter.stackFilter = new StackModelFilter();
                    templateBlockFilter.stackFilter.stackType = currentDesignerService.selectedStackType;
                    templateBlockFilter.stackFilter.level = currentDesignerService.selectedStackLevel;
                    templateBlockFilter.stackFilter.transactionType = currentDesignerService.selectedStackTransactionType;
                }
                else {
                    templateBlockFilter.blockFilterData = new BlockFilterDataModel();
                    templateBlockFilter.blockFilterData.projectYear = currentDesignerService.selectedFilterProjectYear;
                    templateBlockFilter.blockFilterData.BlockCreator = currentDesignerService.selectedFilterBlockCreator;
                    templateBlockFilter.blockFilterData.blockOrigin = currentDesignerService.selectedFilterblockOrigin;
                    templateBlockFilter.blockFilterData.blockState = currentDesignerService.selectedFilterblockState;
                    templateBlockFilter.blockFilterData.blockStatus = currentDesignerService.selectedFilterblockStatus;
                    templateBlockFilter.blockFilterData.industry = currentDesignerService.selectedFilterindustry;
                    templateBlockFilter.blockFilterData.title = currentDesignerService.selectedFiltertitle;
                    templateBlockFilter.blockFilterData.blockType = currentDesignerService.selectedblockType;
                    templateBlockFilter.blockFilterData.description= currentDesignerService.selectedFilterDescription;
                }
                templateBlockFilter.TemplateId = currentDesignerService.templateDetails.templateId;
            }
            return templateBlockFilter;
        }
    }

    CheckIfDeliverableFilterExsists(section, deliverableId) {
        let themingContext = this.sharedService.getSelectedTheme();
        let currentDesignerService = themingContext.themeOptions.find(x => x.name == section).designerService;
        let deliverableBlockFilter = new DeliverableRequestViewModel();
        deliverableBlockFilter.stackFilter = null;
        deliverableBlockFilter.blockFilterData = null;

        if (currentDesignerService.deliverableDetails && (currentDesignerService.deliverableDetails.deliverableId === deliverableId || currentDesignerService.deliverableDetails.entityId === deliverableId)) {

            //TODO: check if all the filter arrays are checked
            if (currentDesignerService.selectedFilterProjectYear.length > 0
                || currentDesignerService.selectedFilterBlockCreator.length > 0
                || currentDesignerService.selectedFilterblockOrigin.length > 0
                || currentDesignerService.selectedFilterblockState.length > 0
                || currentDesignerService.selectedFilterblockStatus.length > 0
                || currentDesignerService.selectedFilterindustry.length > 0
                || currentDesignerService.selectedStackLevel.length > 0
                || currentDesignerService.selectedFiltertitle.length > 0
                || currentDesignerService.selectedStackType.length > 0
                || currentDesignerService.selectedblockType.length > 0) {

                if (currentDesignerService.selectedStackType.length > 0 ||
                    currentDesignerService.selectedStackLevel.length > 0 ||
                    currentDesignerService.selectedStackTransactionType.length > 0) {
                    deliverableBlockFilter.stackFilter = new StackModelFilter();
                    deliverableBlockFilter.stackFilter.stackType = currentDesignerService.selectedStackType;
                    deliverableBlockFilter.stackFilter.level = currentDesignerService.selectedStackLevel;
                    deliverableBlockFilter.stackFilter.transactionType = currentDesignerService.selectedStackTransactionType;
                }
                else {
                    deliverableBlockFilter.blockFilterData = new BlockFilterDataModel();
                    deliverableBlockFilter.blockFilterData.projectYear = currentDesignerService.selectedFilterProjectYear;
                    deliverableBlockFilter.blockFilterData.BlockCreator = currentDesignerService.selectedFilterBlockCreator;
                    deliverableBlockFilter.blockFilterData.blockOrigin = currentDesignerService.selectedFilterblockOrigin;
                    deliverableBlockFilter.blockFilterData.blockState = currentDesignerService.selectedFilterblockState;
                    deliverableBlockFilter.blockFilterData.blockStatus = currentDesignerService.selectedFilterblockStatus;
                    deliverableBlockFilter.blockFilterData.industry = currentDesignerService.selectedFilterindustry;
                    deliverableBlockFilter.blockFilterData.title = currentDesignerService.selectedFiltertitle;
                    deliverableBlockFilter.blockFilterData.blockType = currentDesignerService.selectedblockType;
                }
                deliverableBlockFilter.TemplateId = currentDesignerService.deliverableDetails.deliverableId;
                deliverableBlockFilter.EntityId = currentDesignerService.deliverableDetails.entityId;
            }
            return deliverableBlockFilter;
        }
    }
}