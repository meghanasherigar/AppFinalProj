import { Injectable } from '@angular/core';
import { ProjectDetails } from '../../../@models/projectDesigner/region';
import { BlockDetails, BlockAttributeDetail, BlockRequest, BlockFilterDataModel, blockSelectedModel } from '../../../@models/projectDesigner/block';
import { TemplateViewModel, BlocksTagsResponseModel } from '../../../@models/projectDesigner/template';
import { StackAttributeDetail } from '../../../@models/projectDesigner/stack';
import { DeliverableViewModel, EntityViewModel } from '../../../@models/projectDesigner/deliverable';
import { regions } from '../../../@models/projectDesigner/common';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../@models/common/eventConstants';
import { LibraryDropdownViewModel, FilterLibraryModel } from '../../../@models/projectDesigner/library';
import { DeleteBlockViewModel } from '../../../@models/projectDesigner/library';
import { BehaviorSubject } from 'rxjs';
import { SubMenus, Menus } from '../../../@models/projectDesigner/designer';
import { QuestionsResponseViewModel, QuestionsFilterViewModel, InformationRequestViewModel, CommentsViewModelArray, QuestionsFilterReponseViewModel, InfoReqDetailsForSendReminder, InfoRequestDetailsModel, TableTypeDomainModel, selectedQuestionsViewModel, QuestionTitleModel, QuestionFilterByTemplateOrDeliverableId, QuestionTypeViewModel, PercentageCalculation, QuestionAnswersDetailsViewModel } from '../../../@models/projectDesigner/task';
import { ProjectDeliverableRightViewModel, UserRightsViewModel, DocViewDeliverableRoleViewModel, QuestionIdsViewModel } from '../../../@models/userAdmin';
import { InformationResponseViewModel, InfoQuestionApproved } from '../../../@models/projectDesigner/infoGathering';
import { definedColors } from '../../../@models/admin/library';
import { DocumentLayoutStyle } from '../../../@models/projectDesigner/formatStyle';


@Injectable({
    providedIn: 'root'
})


export class DesignerService {
    currentProjectId: string;
    currentMarginStyle: string;
    currentTemplateOrDeliverableId: string;
    questionFilterForEditOrDelete: QuestionFilterByTemplateOrDeliverableId = new QuestionFilterByTemplateOrDeliverableId();
    showOrHideQuestionList: boolean = true;
    blockQuestionsData: QuestionAnswersDetailsViewModel[] = [];
    allowTagNameChange: boolean;
    showOrHideQuestions: boolean = false;
    isloadedQuestionAndAnswers: boolean = false;
    isTableTypeInLogicType: boolean;
    isExternalUser: boolean;
    disableMessage: boolean = false;
    saveAsDraftCheck : boolean = false;
    viewedInforRequestId: string;
    ViewedIsTemplate: boolean;
    ViewedTemplateOrDelieverable: string;
    informationRequestModel: InformationRequestViewModel = new InformationRequestViewModel();
    deliverableInformationRequestModel: any = [];
    blockTypeInforReq: string;
    isExtendedIconicView: boolean = false;
    blockDetails: BlockDetails;
    focusedEditor : any;
    templateDetails: TemplateViewModel;
    deliverabletemplateDetails: TemplateViewModel;
    attributeDeliverable: any;
    blockAttributeDetail: BlockAttributeDetail;
    blockSelectedModel = new blockSelectedModel();
    blockList: BlockDetails[] = [];
    reportblockList: BlockDetails[] = [];
    disabledButton: boolean = false;
    stackAttributeDetail: StackAttributeDetail;
    tableTypeData: TableTypeDomainModel[] = [];
    disAbleIcon: boolean = false;
    deliverableDetails: DeliverableViewModel;
    entityDetails: EntityViewModel[] = [];
    isTemplateSection: boolean = false;
    isDeliverableSection: boolean = false;
    deleteblock: DeleteBlockViewModel;
    isLibrarySection: boolean = false;
    isCopied: boolean = false;
    libraryDetails: LibraryDropdownViewModel;
    manageLibraryDetails: LibraryDropdownViewModel;
    savedComments: CommentsViewModelArray[] = [];
    canEditAttributeFlag: boolean = true;
    filterLibraryModel: FilterLibraryModel = new FilterLibraryModel();
    //section for block importer -- starts
    importedBlocks: BlockRequest[];
    selectedFileFormat: any;
    biSelectedBlocks: any;
    //block collections save to secondstep  
    addedCollectionBlocks: BlockRequest[] = [];
    savedBlockArray: any = [];
    biAvailableBlocks: any;
    showIconFlag: boolean = true;
    selectedTemplates: TemplateViewModel[];
    selectedDeliverables: EntityViewModel[];
    selectedImportedBlockId: string;
    blockImporterSelectedText: string;
    contextmenu: boolean;
    allowToAssignee: boolean;
    //section for block importer -- ends
    totalBlockCount: number;
    blocksToBeCopied: BlockDetails[];
    informationResponseViewModel: InformationResponseViewModel[] = [];
    infoDraftResponseModel: InfoRequestDetailsModel = new InfoRequestDetailsModel();
    searchIndex: number;
    isFindNext: boolean = false;
    isFindPrevious: boolean = false;
    findElements: any;
    selectedStackLevel = [];
    selectedStackType = [];
    selectedStackTransactionType = [];
    selectedFilterProjectYear = [];
    selectedFilterblockStatus = [];
    selectedFilterblockOrigin = [];
    selectedFiltertitle = [];
    selectedFilterBlockCreator = [];
    selectedFilterblockState = [];
    selectedFilterindustry = [];
    selectedblockType = [];
    selectedStackLevelD = [];
    selectedStackTypeD = [];
    selectedStackTransactionTypeD = [];
    selectedFilterProjectYearD = [];
    selectedFilterblockStatusD = [];
    selectedFilterblockOriginD = [];
    selectedFiltertitleD = [];
    selectedFilterBlockCreatorD = [];
    selectedFilterblockStateD = [];
    selectedFilterindustryD = [];
    selectedblockTypeD = [];
    selectedStackLevelL = [];
    selectedStackTypeL = [];
    selectedStackTransactionTypeL = [];
    selectedFilterProjectYearL = [];
    selectedFilterblockStatusL = [];
    selectedFilterblockOriginL = [];
    selectedFiltertitleL = [];
    selectedFilterBlockCreatorL = [];
    selectedFilterblockStateL = [];
    selectedFilterindustryL = [];
    selectedblockTypeL = [];
    assignToBlockList: any = [];
    definedColorCodes: any = definedColors;
    LoadAllBlocksDocumentView: boolean = false;
    isDoubleClicked = new BehaviorSubject<boolean>(false);
    currentDoubleClicked = this.isDoubleClicked.asObservable();
    expandedBlockData = [];
    isDocFullViewEnabled = new BehaviorSubject<boolean>(false);
    currentDocViewEnabled = this.isDocFullViewEnabled.asObservable();
    selectedSubMenuTab = new BehaviorSubject<SubMenus>(SubMenus.Editor);
    selectedDesignerTab = this.selectedSubMenuTab.asObservable();
    disableInfoReqTab = new BehaviorSubject<boolean>(false);
    isDisabledIndoReqTab = this.disableInfoReqTab.asObservable();
    loadPartialMerge = new BehaviorSubject<boolean>(false);
    partialMergePopUpLoaded = this.loadPartialMerge.asObservable();
    partialMergeContent = new BehaviorSubject<string>("");
    partialMergeContentOb = this.partialMergeContent.asObservable();
    partialMergeBlockTitle = new BehaviorSubject<string>("");
    partialMergeBlockTitleOb = this.partialMergeBlockTitle.asObservable();
    userRights: any;
    //section for task starts
    logicTypeData: any;
    questionText: string;
    questionType: QuestionTypeViewModel = new QuestionTypeViewModel();
    //section for task ends
    //section for Info Gathering Starts
    templateDeliverableList: any = [];
    questionsLoaded: QuestionsResponseViewModel[] = [];
    selectedQuestions: QuestionsResponseViewModel[] = [];
    selectedQuestionTitle: QuestionTitleModel[] = [];
    selectedQuestionIds: string[] = [];
    questionsFilters: QuestionsFilterViewModel = new QuestionsFilterViewModel();
    questionFilterResponse: QuestionsFilterReponseViewModel = new QuestionsFilterReponseViewModel();
    selectedEntities: EntityViewModel[] = [];
    infoGatheringUpdateId: string;
    isEditInfoRequest: boolean;
    infoRequestId: string;
    templateDeliverableIdAppendix: string;
    UploadedFileName: string;
    FileName: string;
    DisableBCCBtn: boolean = false;
    CoReviewerList: any = [];
    AssignToList: any = [];
    isTemplateSelected: boolean;
    isDeliverableSelected: boolean;
    attachmentsFormData: any = [];
    questionIdsViewModel: QuestionIdsViewModel[] = [];
    updatedQuestionGridList: QuestionsResponseViewModel[] = [];
    InfoReqSendMail: boolean = false;
    selectedQuestionsViewModelArray: selectedQuestionsViewModel[] = [];
    isQuestionDataUpdated: boolean = false;
    //section for Info Gathering Ends
    projectUserRightsData: ProjectDeliverableRightViewModel;
    docViewAccessRights: UserRightsViewModel;
    selectedDeliverableDocRights: DocViewDeliverableRoleViewModel[];
    selectedEntityRights: any;
    prevTempOrDelId: string;
    entititesSelectedInTemplate: EntityViewModel[] = [];
    findEnable: boolean = false;
    selectedText: string;
    selectedAbbreviationIds: string[] = [];
    isRestrictedSave: boolean = false;
    ckeditortoolbar: any;
    selectedDocTab: any;
    isForwardMail: boolean = false;
    editQuestionIds: string[] = [];
    editquestionClicked: boolean;
    canCreateQuestion: boolean;
    isInforeqsendReminder: boolean;
    inforequestSendReminder: InfoReqDetailsForSendReminder[] = [];
    InfoQuestionApproved: InfoQuestionApproved[] = [];
    infoRequestStatus: string;
    infoRequestinProgressEdited: boolean;
    createQuestionTableType: TableTypeDomainModel;
    createQuestionLogicTypeTable: TableTypeDomainModel[] = [];
    isReportReview: boolean = false;
    isToggleAnswerTag: boolean = false;
    appendixBlocks: any;
    appendixBlockExists: boolean;
    selectedThemeInContext: any;

    selectedTextStyle: any;
    enableDefaultPainter: boolean = false;
    enableFormatPainter: boolean = false;
    bookmarkList: any = [];

    // starts selected iconic menus & designer meu tabs

    selectedMenu = new BehaviorSubject<Menus>(0);
    selectedMenus = this.selectedMenu.asObservable();
    selectedSubMenu = new BehaviorSubject<SubMenus>(0);
    selectedSubMenus = this.selectedSubMenu.asObservable();

    // ends selected iconic menus & designer meu tabs

    // Starts Hide/Show information request
    hideShowMenu = new BehaviorSubject<Menus>(0);
    hideShowMenus = this.hideShowMenu.asObservable();
    // Stop Hide/Show information request

    // starts souce origin from projectmanagement to designer
    navigationorigin = new BehaviorSubject<string>("");
    navigationSource = this.navigationorigin.asObservable();
    // Ends souce origin from projectmanagement to designer

    //deliverable-group:start
    reloadGroupGrid = new BehaviorSubject<boolean>(false);
    //deliverable-group:end

    percentageCalculations: PercentageCalculation[] = [];
    blocksTags: BlocksTagsResponseModel[] = [];
    isBlocksTagsEdited: Boolean = false;
    hashTagList: any = [];

    //section for layout styles declaration
    layoutStyles : DocumentLayoutStyle[];
    selectedLayoutStyleId : string;
    isGlobalTemplate: boolean = null;
    globalOrCountryTemplateId: string;
    isProjectManagement: boolean = false;
    isAdminModule: boolean = false;

    constructor(private _eventService: EventAggregatorService) { }

    clear() {
        this.blockDetails = null;
        this.blockAttributeDetail = null;
        this.stackAttributeDetail = null;
        this.blockList = [];
        this.reportblockList = [];
        this.importedBlocks = [];
        this.prevTempOrDelId = null;
        this.assignToBlockList = [];
    }

    filterData() {
        this.selectedFilterProjectYear = [];
        this.selectedFilterblockStatus = [];
        this.selectedFilterblockOrigin = [];
        this.selectedFiltertitle = [];
        this.selectedFilterBlockCreator = [];
        this.selectedFilterblockState = [];
        this.selectedFilterindustry = [];
        this.selectedblockType = [];



    }
    changeIsDoubleClicked(isDoubleClicked: boolean) {
        this.isDoubleClicked.next(isDoubleClicked);
    }
    changeIsDocFullView(updatedValue: boolean) {
        this.isDocFullViewEnabled.next(updatedValue);
    }
    changeTabDocumentView(updatedValue: SubMenus) {
        this.selectedSubMenuTab.next(updatedValue);
    }

    // starts Menus  behaviours
    selecteMenu(selecteMenus: Menus) {
        this.selectedMenu.next(selecteMenus);
    }

    selectedSubmenus(selecteSubmenu: SubMenus) {
        this.selectedSubMenu.next(selecteSubmenu);
    }

    navigation(origin: string) {
        this.navigationorigin.next(origin);
    }

    hideOrShowMenus(flag: Menus) {
        this.hideShowMenu.next(flag);
    }

    // Ends Menus  behaviours


    changeReloadGroupingGrid(reload: boolean) {
        this.reloadGroupGrid.next(reload);
    }

    clearinforRequest() {
        if (this.informationRequestModel != undefined) {
            this.informationRequestModel.Id = null;
            this.informationRequestModel.Name = '';
            this.informationRequestModel.AssignTo = [];
            this.informationRequestModel.CoReviewer = [];
            this.informationRequestModel.DueDate = null;
            this.informationRequestModel.IsViewBlock = false;
            this.informationRequestModel.ViewBlockList = [];
            this.informationRequestModel.BlockIds = [];
            this.informationRequestModel.Questions = [];
            this.informationRequestModel.TemplateId = '';
            this.informationRequestModel.DeliverableId = '';
            this.informationRequestModel.Filters = null;
            this.informationRequestModel.CoverPage = '';
            this.informationRequestModel.AnswerDetails = [];
        }
        this.selectedQuestions = [];
    }
}