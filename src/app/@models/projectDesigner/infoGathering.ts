import { UserSearchResult } from '../userAdmin';
import { UserBasicViewModel, selectedQuestionsViewModel, UserBasicViewModelInfoReq } from './task';
import { SendEmailModel, BaseFilterViewModel } from '../common/commonmodel';

export class InformationRequestMenuViewModel {
    name: any = [];
    status: any = [];
    assignTo: any = [];
    coReviewer: any = [];
    dueDateMin: any;
    dueDateMax: any;
    updatedBy: any = [];
    updatedOnMin: any;
    updatedOnMax: any;
}
export class InformationRequestFilterViewModel extends BaseFilterViewModel {
    projectId: string;
    nameId: any = [];
    statusId: any = [];
    assignToId: any = [];
    coReviewerId: any = [];
    dueDateMin: any;
    dueDateMax: any;
    updatedById: any = [];
    updatedOnMin: any;
    updatedOnMax: any;
}
export class InformationResponseViewModel {
    id: string;
    name: string;
    assignTo: UserBasicViewModelInfoReq[] = [];
    coReviewer: UserBasicViewModel[] = [];
    dueDate: any;
    status: any;
    updatedBy: any;
    updatedOn: any;
    isViewBlock: boolean = false;
    blockIds: string[];
    questions: selectedQuestionsViewModel[] = [];
    filters: any;
    coverPage: string;
    projectId: string;
    templateId: string;
    deliverableId: string;
    isSaved: boolean;
}
export class InfoQuestionApproved {
    questionId: string;
    isapproved: boolean;
}
export class ApproveOrRejectDataModel {
    informationRequestId: string;
    questionnairesId: string;
    questionId: string;
    isapproved: boolean;
    isNotApplicable:boolean=false;
    templateId: string;
    deliverableId: string;
    status: string;
}
export class DeleteAttachmentDataModel {
    questionnariesID: string;
    questionId: string;
    id: string;
    templateId: string;
    deliverableId: string;
}
export enum Index {
    zero,
    one,
    two,
    three,
    four,
    five,
    six
}
export enum InfoRequestStatus {
    Draft = '1',
    InProgress = '2',
    Review = '3',
    Final = '4',
}
export enum QuestionType {
    FreeText = "Free Text",
    Logical = "Logic Type",
    DropDown = "Drop Down Type",
    TableType = "Table Type",
    NumberType = "Number Type",
    DateType = "Date Type",
    YesNo = "Yes/No Type",
    BenchmarkRangeType = "Benchmark Range Type",
    ComparabilityAnalysisType  = "Comparability Analysis Type",
    CoveredTransactionType  = "Covered Transaction Type",
    PLQuestionType = "P/L Question Type",
    ListType = "List Type",
    tablTypeHeader = "tablTypeHeader",
}
export class InfoRequestSendEmailReminderModel extends SendEmailModel {
    informationRequestId: string;
    emailStatus: string;
}

export const createInfoLabels =
{
    "SaveAsProgress": "Save",
    "SaveAsDraft": "Draft",
    "Send": "Send",
    "ViewMore": 'View more',
    "Data": "data",
    "ViewBlocks":"ViewBlocks",
    "RequestName": "RequestName",
    "DueDate": "DueDate",
    "Remove": "remove",
    "Download": "download",
    "Appendix": "appendix",
    "Approve": "Approve",
    "Reject": "Reject",
    "QuestionnairesId": "questionnairesId",
    "FileTypeZip": "application/zip",
    "FileExtPDF": "pdf",
    "FileExtDoc": "doc",
    "FileExtDocx": "docx",
    "FileExtXLS": "xls",
    "FileExtXLSX": "xlsx",
    "FileExtPPT": "ppt",
    "FileExtPPX": "ppx",
    "FileExtJPG": "jpg",
    "FileExtPNG": "png",
    "FileFormControl": "files",
    "FileFormData": "file",
    "CreatedDateId": "#createdDate",
    "Controls": "controls",
    "DummyFileId": "dummy_",
    "UpdatedOn": "UpdatedOn",
    "DueDateId": "#dueDate",
    "UpdatedOnId": "#updatedOn",
    "MBSize": 1048576,
    "DecimalFix": 3,
    "FileSizeLimit": "50",
    "Draft": 1,
    "InProgress": "In Progress",
    "Introduction": "Introduction",
    "InReview": "In Review",
    "SendMail": "sendMail"
}

export const possibleSteps = [
    { id: 1, path: "info-status", name: "Select Question" },
    { id: 2, path: "info-settings", name: "Info Request Settings" },
    { id: 3, path: "cover-page", name: "Cover Page" },
    { id: 4, path: "info-preview", name: "Preview" },
]

