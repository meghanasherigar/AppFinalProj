import { BlockType } from './block';
import { KeyValueViewModel } from './report';
import { UserSearchResult } from '../userAdmin';
import { BaseFilterViewModel } from '../common/commonmodel';

export class QuestionDataModel {
    id: string;
    questionId: string;
    blockId: string;
    stackId: string;
    projectId: string;
    blockType: BlockType;
    questionType: QuestionTypeViewModel;
    tagName: string;
    title: string;
    comments: string;
    allowAssigneeAttached: boolean;
    dropdownType: DropdownTypeQuestion;
    logicType: LogicTypeViewModel;
    tableType: TableTypeDomainModel;
    allowTagNameChange: boolean;
}
export class QuestionTypeViewModel {
    id: string;
    typeName: string;
}
export class QuestionTagViewModel {
    id: string;
    projectid: string;
    tag: string
    templateId: string;
    deliverableId: string;
}
export class DropdownTypeQuestion {
    modeOfSelection: boolean;
    options: string[] = [];
}
export class LogicTypeViewModel {
    options: string[] = [];
    subQuestions: SubQuestionViewModel[] = [];
}
export class SubQuestionViewModel {
    option: string;
    isConditionalQuestion: boolean;
    title: string;
    questionType: QuestionTypeViewModel;
    dropdownType: DropdownTypeQuestion;
    logicType: LogicTypeViewModel;
    tableType: TableTypeDomainModel;
}

export class CommentAuditTrailViewModel {
    createdBy: UserBasicViewModel = new UserBasicViewModel();
    createdOn: string;
    updatedBy: UserBasicViewModel = new UserBasicViewModel();
    updatedOn: string;
}

export class QuestionsMenuViewModel {
    questionType: any = [];
    blockType: any = [];
    tags: any = [];
    templates: any = [];
    deliverables: any = [];
    createdBy: any = [];
    createdOnMin: any;
    createdOnMax: any;
}
export class QuestionsFilterViewModel  extends BaseFilterViewModel{
    projectId: string;
    questionTypeId: string[] = [];
    blockTypeId: string[] = [];
    tagsId: string[];
    templateId: string[] = [];
    deliverablesId: string[] = [];
    createdById: string[];
    createdOnMin: Date;
    createdOnMax: Date;
}
export class QuestionsFilterReponseViewModel {
    projectId: string;
    questionTypeId: string[] = [];
    blockTypeId: string[] = [];
    tagsId: string[];
    templateId: string;
    deliverablesId: string[];
    createdById: string[];
    createdOnMin: Date;
    createdOnMax: Date;
    pageSize: any;
    pageIndex: any;
}

export class QuestionsResponseViewModel {
    questionnariesId: string;
    id: string;
    tagName: string;
    title: string;
    questionType: QuestionTypeViewModel;
    comments: string;
    answerAvailable: boolean;
    answer: string;
    blockTitle: string;
    blockType: BlockType;
    createdBy: UserSearchResult;
    templateIds: string[];
    delivearbleIds: string[] = [];
    totalRecords: number;
}
export const QuestionRelated =
{
    "logicType": 'Logic Type',
    "CreatedDate": 'CreatedDate'
}

export class insertCoverPage  {

    id: string;
    projectid: string;
    templateordeliverableid: string;
    content: string;
    contenttype: string;
    istemplate: boolean;
    watermark: string;
    margin: string;
    isDefaultCoverPage: boolean;
}

export class coverPageResponse {
    header: string;
    footer: string;
    pazeSize: number;
    margin: string;
    orientation: string;
    templateColumn: string;
    watermark: string;
    pageColor: string;
    pageBorder: string;
    tableOfContent: string;
    coverPage: coverPage;
}

export class auditTrail {
    createdBy : createdBy;
    createdOn: string;
    updateBy: createdBy;
    updatedOn: string;
}

export class coverPage {
    id: string;
    projectId: string;
    templateOrDeliverableId: string;
    content: string;
    contentType: string;
    isTemplate: boolean;
    watermark: string;
    margin:string;
    auditTrail: auditTrail;
    uId: string;
    isDefaultCoverPage: boolean = false;
}

export class createdBy {
    isActive: boolean;
    firstName: string;
    lastName: string;
    email:string;
    fullName: string;
}

export class updateInsertCoverPageRequest {
    id:string;
    projectId: string;
    templateOrDeliverableId: string;
    content: string;
    contentType: string;
    isTemplate: boolean;
    watermark: string;
    margin: string;
    auditTrail: string;
    uId: string;
    isDefaultCoverPage: boolean;
}


export class InformationRequestViewModel {
    Id: string = null;
    ProjectId: string;
    Name: string;
    AssignTo: UserBasicViewModelInfoReq[] = [];
    CoReviewer: UserBasicViewModel[] = [];
    DueDate: Date;
    IsViewBlock: boolean = false;
    ViewBlockList: ViewBlockResponseViewModel[] = [];
    BlockIds: string[] = [];
    Questions: selectedQuestionsViewModel[] = [];
    TemplateId: string = '';
    DeliverableId: string = '';
    Filters: InformationFiltersViewModel;
    CoverPage: string = '';
    AnswerDetails: AnswerDetailsRequestModel[] = [];
    comments: CommentsViewModel[];
    IsCompleteRequest: boolean;
}
export class InfoRequestDetailsModel extends InformationRequestViewModel {
    status: any;
    selectedQuestionsResponse: QuestionsResponseViewModel[] = [];
    questionsFilters: QuestionsFilterViewModel = new QuestionsFilterViewModel();
    DeliverableId: string = '';
}
export class QuestionFilterByTemplateOrDeliverableId {
    projectId: string;
    templateOrDeliverableId: string;
    isTemplate: boolean;
}
export class selectedQuestionsViewModel {
    questionnaireId: string;
    questionId: string;
    title: string;
    blockTitle: string;
    blockType: string;
    isApproved?: boolean;
    isNotApplicable?: boolean;
}

export class UserBasicViewModel {
    firstName: string;
    lastName: string;
    email: string;
}
export class UserBasicViewModelInfoReq extends UserBasicViewModel {
    isForwarded: boolean
}

export class InformationFiltersViewModel {
    QuestionType: string[] = [];
    BlockType: string[] = [];
    Tag: string[] = [];
    CreatedBy: string[] = [];
    CreatedOnMin: Date;
    CreatedOnMax: Date;
    TemplateId: string = '';
    DeliverableIds: string[] = [];
}

export class ProjectUsersListViewModel {
    ProjectId: string;
    TemplateId: string;
    Deliverables: string[] = [];
}

export class ProjectUsersListResultViewModel {
    userFirstName: string;
    userLastName: string;
    userEmail: string;
}

export class ViewBlockResponseViewModel {
    blockId: string;
    title: string;
    description: string;
    colorCode: string;
    blockContent: string;
    checked: boolean = false;
    blockType: BlockType;
}

export class QuestionAnswersDetailsViewModel {
    questionnariesId: string;
    blockId: string;
    questionId: string;
    isNotApplicable: boolean;
    allowToEdit: boolean;
    tag: string;
    allowAssigneeAttached: boolean;
    title: string;
    comments: string;
    isPartOfOtherInfoReq: boolean;
    isShowOrHide: boolean;
    typeDetails: TypeViewModel;
    answerDetails: AnswerDetailsDomainModel;
    forwardQuestionsComments: ForwardQuestionCommentDomainModel[] = [];
    blockType: BlockType;
    auditTrail: CommentAuditTrailViewModel = new CommentAuditTrailViewModel();
    isApproved: boolean;
    entityId: string;
    isInfoRequestMapped: boolean;
    isInfoRequestStatusInProgress: boolean;
}
export class ForwardQuestionCommentDomainModel {
    comment: string;
    forwardedOn: Date;
}
export class QuestionAnswerDetailsEntityLevel {
    deliverableId: string;
    questionAnswerDetails: QuestionAnswersDetailsViewModel[] = [];
}
export class AnswerVersionViewModel {
    templateOrDeliverableId: string;
    versions: VersionViewModel[];
}
export class VersionViewModel {
    id: string;
    answer: string;
    auditTrail: CommentAuditTrailViewModel = new CommentAuditTrailViewModel();
    cellValues: CellValue[];
}

export class CellValue {
    id: string;
    key: string;
    value: string;
    childTag: string = '';
    isEditable: boolean = false;
}
export class CellDataModel {
    id: string;
    innerHtml: any;
    innerText: string;
}

export class TypeViewModel extends CellValue {
    id: string;
    questionType: QuestionTypeViewModel;
    //dropdown
    modeOfSelection: boolean;
    options: string[];
    //boolean
    values: boolean;
    //logic
    //options: string[];
    subQuestions: subQuestionDomainModel[];
    //table
    text: string;
    cellValues: CellValue[];
}

export class InformationRequestPreviewViewModel {
    Id: string;
    projectId: string;
    questionIds: string[] = [];
    templateOrDeliverableId: string;
    isTemplate: boolean;
    blockTypeId: string;
}

export class BooleanTypeDomainModel extends TypeViewModel {
    values: boolean;
}
export class DropDownTypeDomainModel extends TypeViewModel {
    modeOfSelection: boolean;
    options: string[];
}

export class LogicTypeDomainModel extends TypeViewModel {
    options: string[];
    subQuestions: subQuestionDomainModel[];
}
export class subQuestionDomainModel {
    id: string;
    option: string;
    isConditionalQuestion: boolean;
    title: string;
    typeDetails: TypeDetailsDomainModel;
    answerDetails: AnswerDetailsDomainModel;
    fwdMessages: string;
}
export class TableTypeDomainModel {
    text: string;
    rows: number;
    columns: number;
    cellValues: CellValue[] = [];
}

export class TypeDetailsDomainModel extends CellValue {
    id: string;
    questionType: QuestionTypeDomainModel;
    modeOfSelection: boolean;
    options: string[];
    values: boolean;
    cellValues: CellValue[];
    subQuestions: subQuestionDomainModel[];
    text: string;
}
export class AnswerDetailsDomainModel {
    deliverables: AnswerVersionDomainModel[];
    templates: AnswerVersionDomainModel[];
}
export class QuestionTypeDomainModel {
    id: string;
    typeName: string;
}
export class QuestionTitleModel {
    questionId: string;
    questionarieId: string;
    title: string;
    isForwarded: boolean;
}
export class AnswerVersionDomainModel {
    templateOrDeliverableId: string;
    versions: VersionDomainModel[];
    attachments: AttachmentDomainModel[];
    comments: CommentsDomainModel[];
    isNotApplicable: boolean;
}
export class AttachmentDomainModel {
    id: string;
    name: string;
    uploadedName: string;
    extension: string;
    file: FormData;
    isActive: boolean
}
export class CommentsDomainModel {
    id: string;
    parentId: string;
    message: string;
    isExternal: boolean;
    auditTrail: CommentAuditTrailViewModel = new CommentAuditTrailViewModel();
    isActive: boolean;
    index: number;
    isExternalUser: boolean;
}


export class VersionDomainModel {
    id: string;
    answer: string;
    isApproved: boolean;
    cellValues: CellValue[];
}
export class FileData {
    id: string;
    name: string;
    fileExt: string;
    fileFormData: FormData = new FormData();
}

export class AnswerDetailsRequestModel {
    questionnairesId: string;
    questionId: string;
    answer: string;
    deliverableId: string = '';
    templateId: string = '';
    answerId: string;
    type: string;
    subAnswer: SubAnswerDetailsRequestViewModel[] = [];
    attachments: AttachmentViewModel[];
    comments: CommentsViewModel[];
    cellValue: CellValue[] = [];
}

export class InformationRequestStatusViewModel {
    informationRequestId: string;
    status: string;
    answerDetails: AnswerDetailsRequestModel[];
}
export class CommentsViewModel {
    id: string;
    parentId: string;
    message: string;
    isExternal: boolean;
    index: number;
    isActive: boolean;
    isExternalUser: boolean;
}

export class CommentsViewModelArray {
    comments: CommentsViewModel[] = [];
}
export class CommentDomainModelArray {
    comments: CommentsDomainModel[] = [];
}
export class AttachmentViewModel {
    id: string;
    name: string;
    uploadedName: string;
    extension: string;
    file: FormData = new FormData();
    isActive: boolean;

}
export class SubAnswerDetailsRequestViewModel {
    subQuestionId: string;
    subAnswerId: string;
    subAnswer: string;
    cellValue: CellValue[] = [];
    type: string;
}

export class AnswerAvailableViewModel {
    deliverableAnswer: DeliverableAnswerViewModel[];
    templateAnswer: TemplateAnswerViewModel[];
    text: string;
}

export class editAnswerPayload {
    tag: string;
    questionIndex: number;
    questionType: string;
}
export class DeliverableAnswerViewModel {
    id: string;
    name: string;
    taxableYearEnd: any;
    answers: VersionViewModel[];
}

export class TemplateAnswerViewModel {
    id: string;
    name: string;
    answers: VersionViewModel[];
}

export class InfoGatheringIcons {
    EnableCreateInfoRequest: boolean = false;
    EnableSaveAsDraft: boolean = false;
    EnableForward: boolean = false;
    EnableClose: boolean = false;
    EnableSendBackForReview: boolean = false;
    EnableSendBackForAssignee: boolean = false;
    EnableEditQuestion: boolean = false;
    EnableApproveRejectReviewer: boolean = false;
    EnableApproveRejectAssignee: boolean = false;
    EnableViewHistory: boolean = false;
    EnableForwardIcon: boolean = false;
    EnableFinalze: boolean = false;
    EnableOptionsCheckboxList: boolean = false;
    DisablePageForReviewWhenInProgress: boolean = false;
    EnableNotApplicable: boolean = false;
    HideNotApplicable: boolean = false;
    ShowNotApplicable: boolean = false;
}

export class UserInformationRequestViewModel {
    informationRequest: string;
    isCoReviewer: boolean = false;
    isAssignTo: boolean = false;
    isCreator: boolean = false;
}

export class InfoReqDetailsForSendReminder {
    projectId: string;
    infoRequestId: string;
    assignTo: UserBasicViewModel[] = [];
    coReviewer: UserBasicViewModel[] = [];
    status: boolean;
}

export class CheckedViewModel {
    id: string;
    name: string;
    checked: boolean;
    taxableYearEnd: string;
}

export class SelectedQuestionsViewModel {
    informationRequestId: string;
    questionnaireId: string;
    questionId: string;
    title: string;
    blockTitle: string;
    blockType: string;
}

export class AnswerHistoryViewModel {
    questionName: string;
    questionnariesId: string;
    questionId: string;
    templateOrDeliverableId: string;
    isTemplate: boolean;
    questionType: string;
}

export class EntityRoleViewModel {
    entityId: string;
    entityName: string;
    taxableYearEnd: Date;
    templateId: string;
    templateName: string;
}

export class AppendixDomainViewModel {
    Id: string;
    ProjectId: string;
    AppendixName: string;
    FileName: string;
    UniqueFileName: string;
    Comment: string;
    AssociatedTo: AppendixDeliverableDomainModel[];
    IsActive: boolean = false;
    Industry: BlockIndustryDomainModel[];
    ProjectYear: number;
    OrganizationId: string;
    BlockId: string;
}

export class AppendixDeliverableDomainModel {
    DeliverableId: string;
    DeliverableName: string;
    TaxableYearEnd: Date;
}

export class BlockIndustryDomainModel {
    Id: string;
    IndustryName: string;
    SubIndustries: BlockSubIndustryDomainModel[];
}

export class BlockSubIndustryDomainModel {
    Id: string;
    SubIndustry: string;
}
export class PercentageCalculation {
    blockType: string;
    questionId: string;
    count: number;
    isIncreased: boolean;
}