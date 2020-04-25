
export class Email {
    firstName: string;
    lastName: string;
    email: string;
}
export class EmailDetails {
    to: Email[] = [];
    cc: Email[] = [];
    bcc: Email[] = [];
    subject: string;
    content: string;
    isToDisabled: boolean = false;
    isCCDisabled: boolean = false;
    isBCCDisabled: boolean = false;

    //Added to act as a simple email component by overriding any business specific use case
    isGenericMailer: boolean = false;
}
export enum emailEnum {
    to = 1,
    cc = 2,
    bcc = 3,
}
export class SendEmailModel {
    sentTo: Email[] = [];
    cc: Email[] = [];
    bcc: Email[] = [];
    subject: string;
    content: string;
}

export enum MarginStyles {
    narrow = "Narrow",
    normal = "Normal",
    moderate = "Moderate",
    wide = "Wide",
    custom = "Custom"
}


export class BaseFilterViewModel{
  pageIndex?: number=0;
  pageSize?: number=0;
  sortColumn?:string;
  sortDirection?:string;
}
