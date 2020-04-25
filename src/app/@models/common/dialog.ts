export enum DialogTypes {
    Success,
    Error,
    Info,
    Warning,
    Delete,
    Confirmation,
    Update,
    AddtoUserLibrary,
    PullBack,
    SendBack
}

export class Dialog {
    Type : DialogTypes;
    Message : string;
}