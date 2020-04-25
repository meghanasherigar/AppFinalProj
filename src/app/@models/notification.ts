export enum NotificationType {
        FAQ = 1,
        UserManual = 2,
        WhatNew = 3,
        BlockDeletion = 4,
        PrivacyPolicy = 5,
        TermsOfUse = 6,
        BlockAssignment = 7,
        ReportAssignment = 8,
        InformationRequestAssignment = 9,
        InformationRequestCompletion = 10,
        InformationRequestPullBack = 11,
        BlockDeletionFromCBC = 12,
        EntityDeletion = 13,
        UserDeletion = 14,
        TemplateDeletion = 15,
        TransactionDeletion = 16,
        EntityScope = 17,
        TransactionScope = 18,
        BlockSuggestion = 19,
        DeliverableStatutoryDueDateReminder = 20,
        DeliverableIssueDateReminder = 21,
        TaskDueDateReminder = 22
}

export class NotificationResponseModel{
  notifications: NotificationViewModel[];
  totalCount: number;
  totalUnreadCount: number;
}

export class NotificationViewModel
    {
        id: string;
        User: UserBasicViewModel;
        NotificationType: NotificationType;
        MessageContent: string;
        IsRead: boolean;
        CreatedOn: Date;
        IsDeleted: boolean;
        IsActionRequired: boolean;
        ActionTakenOn: Date;
        ActionTaken: boolean;
        ActionReference: ActionReferenceData;
        requestedBy: UserBasicViewModel;
        displayMessage: string;
    }

  export class UserBasicViewModel
    {
        FirstName: string;
        LastName: string;
        Email: string; 
        IsActive: boolean; 
    }   

    export class ActionReferenceData
    {
      ProjectId:string ;
      TemplateBinding:string; 
      EntityId: string;  
      DeliverableId: string;  
      BlockId: string;   
      InformationRequestId: string ;
      DueDate: Date; 
    }

    export class NotificationGridModel {
        NotificationViewModel : NotificationViewModel;
        displayMessage: string;
        clickable: boolean;
    }

    export class EntityOutScopeModel {
      EntityIds : string[];
      ProjectId : string;
    }

    export class TransactionOutScopeModel{
      TransactionIds : string[];
      ProjectId : string;
    }