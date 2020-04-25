import { BaseFilterViewModel } from './common/commonmodel';

export interface Upload {
    FileUpload: String;
    UploadedBy: String;
    Date: String;
    Error: String;
    Action: String;

}
export class UploadHistory {
    Id: String;
    ProjectId: String;
    FileName: String;
    UploadedBy: String;
    UploadedByEmail: String;
    UploadedOn: Date;
    NoOfEntitiesCreated: number;
    NoOfEntitiesEdited: number;
    NoOfEntitiesDeleted: number;
    NoOfEntitiesError: number;
    NoOfTransactionsCreated: number;
    NoOfTransactionsEdited: number;
    NoOfTransactionsDeleted: number;
    NoOfTransactionsError: number;
}

export class UploadHistoryResponseViewModel{
    uploadHistoryData : UploadHistory[];
    totalCount : number
}

export class UploadHistoryFilter extends BaseFilterViewModel {
    id: string;
    projectId: String;
    fileName: [];
    userName: [];
    uploadedBy: any;
    uploadedOnStart: string;
    uploadedOnEnd: string;
    //
}
export class UploadHistoryFilterMenuModel
{
    projectId: String;
    uploadedBy: FilterViewModel[];
    uploadDateStart : Date;
    uploadDateEnd : Date;
}
export class FilterViewModel
{
    id: string;
    name: string;
}