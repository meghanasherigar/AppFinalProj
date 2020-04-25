import { taskTypes } from "../Project-Management-Constants";
import { BaseFilterViewModel } from '../../../../@models/common/commonmodel';

export class taskFilterRequest extends BaseFilterViewModel {
  projectId?: string;
  nameId?: string[];
  statusId?: string[];
  assignToId?: string[];
  coReviewerId?: string[];
  dueDateMin?: string;
  dueDateMax?: string;
  updatedById?: string[];
  updatedOnMin?: string;
  updatedOnMax?: string;
  myTasksOnly:boolean=false;
  assignedToMe?:boolean=false;
  assignedByMe?:boolean=false;
  others?:boolean = false;
  searchText?:string = null;
  dataSource?: string[];
}

export class taskReportResponse {
  totalCount: number;
  tasks: taskReport[];
}

export class userBasicModel
{
  firstName:string;
  lastName:string;
  email:string;
}

export class auditTrailModel
{
  createdBy:userBasicModel;
  createdOn:string;
  updatedBy:userBasicModel;
  updatedOn:string;
}

export class taskReport {
  id: string;
  name: string;
  projectId: string;
  templateId: string;
  deliverableId: string;
  dueDate: string;
  status: string;
  updatedBy?: string;
  updatedOn: string;
  taskType:string;
  isViewBlock: boolean;
  blockIds?: string;
  questionIds?: string;
  coverPage?: string;
  comments?: string;
  auditTrail:auditTrailModel;
}

export class otherTaskrequest {
  InformationData: InformationRequestViewModel
  file: any;
  fileName: string;
  fileType: string;
}

export class InformationRequestViewModel {
  name: string;
  projectId: string;
  dueDate: string;
  taskType:string;
  TaskTypeValue: number;
  Id: string = null;
  ProjectId: string;
  Name: string;
  AssignTo: UserBasicViewModel[] = [];
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
  AnswerDetails: AnswerDetailsRequestModel[];
  comments: CommentsViewModel[];
  IsCompleteRequest: boolean;
}

export enum infoStatus {
  inProgress = "In Progres",
  assigned = "Assigned",
  review = "Review",
  final = "Final"
}

export class UserBasicViewModel {
  firstName: string;
  lastName: string;
  email: string;
}

export class AnswerDetailsRequestModel {
  questionnairesId: string;
  questionId: string;
  answer: string;
  deliverableId: string;
  templateId: string;
  answerId: string;
  type: string;
  subAnswer: SubAnswerDetailsRequestViewModel[] = [];
  attachments: AttachmentViewModel[];
  comments: CommentsViewModel[];
}

export class AttachmentViewModel {
  id: string;
  name: string;
  uploadedName: string;
  extension: string;
  file: FormData = new FormData();
  isActive: boolean;

}

export class CommentsViewModel {
  id: string;
  parentId: string;
  message: string;
  isExternal: boolean;
}

export class SubAnswerDetailsRequestViewModel {
  subQuestionId: string;
  subAnswerId: string;
  subAnswer: string;
}

export class selectedQuestionsViewModel {
  questionnaireId: string;
  questionId: string;
  title: string;
  blockTitle: string;
  blockType: string;
  isApproved?: boolean;
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

export class ViewBlockResponseViewModel {
  blockId: string;
  title: string;
  description: string;
  colorCode: string;
  blockContent: string;
  checked: boolean = false;
}

export class SelectedQuestionsViewModel {
  informationRequestId: string;
  questionnaireId: string;
  questionId: string;
  title: string;
  blockTitle: string;
  blockType: string;
}

export interface taskFilterResponse {
  taskTypes: string[];
  taskStatus: string[];
  userAssignmentModel: userAssignment[];
  minDueDate: string;
  maxDueDate: string;
}

export class taskCompletionModel
{
  deliverableId?: string;
  templateId?: string;
  blockId? :string;
  taskType:taskTypes;
  infoRequestId?:string;
  users?:userAssignment[];
  dueDate?:string;
  note?:string;
  name?:string;
}

export interface assignedByUser {
  email: string;
  fullname: string;
}

export class userAssignment {
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  id:string;
}

export class userSearchModel
{
  searchText?:string;
    deliverableId?: string;
    templateId?: string;
    projectId?:string;
}