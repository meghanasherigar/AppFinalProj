export class PrivacyStatementViewModel
{
    id : string;
    privacyStatementContent: string;
    userType: string;
}

export class PrivacyStatementResponceViewModel
{
    id : string;
    privacyStatementContent: string;
    userName : string;
    updatedOn : Date;
    publishedBy: string;
    publishedOn: Date;
    isPublishedUser: boolean;
}