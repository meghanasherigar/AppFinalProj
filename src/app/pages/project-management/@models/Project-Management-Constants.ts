export const ProjectManagementConstants = {
  DefaultDate: "0001-01-01T00:00:00Z",
  DefaultObjectId: "000000000000000000000000",
  TEMPLATE: "template",
  DELIVERABLE: "deliverable",
}

export enum ToggleButton {
  On = 1,
  Off = 0
}
export enum ProjectSettigns {
  ExternalUserSetting = 5
}
export enum TaskStatus {
  COMPLETE = 'Completed',
  FINAL = 'Final'
}

export const TaskStatusConstant =
{
  'Draft': 'Draft',
  'InProgress': 'In Progress',
  'InReview': 'InReview',
  'Completed': 'Completed'
}

export enum TaskSubMenu {
  AllTasks = 1,
  MyTasks
}

export const CustomColumns =
{
  'Comments': 'TaskComments',
  'UserTaskDueDate': 'UserTaskDueDate',
  'DueDate': 'TaskDueDate',
  'Status': 'TaskStatus',
  'AssignedBy': 'AssignedBy',
  'AssignedTo': 'AssignedTo',
  'LastUpdated': 'LastUpdated',
  'TaskCompletionStatus': 'TaskCompletionStatus',
  'MyTaskCompletionStatus': 'MyTaskCompletionStatus',
  'MyTaskName': 'MyTaskName',
  'Entity': 'Entity',
  'CounterParty': 'CounterParty'
}

export enum fileExtensions {
  PDF = ".pdf",
  EXCEL = ".xls",
  DOC = ".docx",
  PNG = ".png",
  JPG = ".jpg",
  TEXT = ".txt",
  ZIP = ".zip"

}

export enum taskTypes {
  INFORMATIONREQUEST = 'Information Request',
  OTHERS = 'Others',
  BLOCKREVIEW = 'Block Review',
  REPORTREVIEW = 'Report Review',
}

export enum taskSummaryBarEnum {
  TaskStatus = 'TaskStatus',
  Assignment = 'Assignment',
}