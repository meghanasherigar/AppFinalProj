export class UserGrid
{
    public id:string;
    public userId:string;
    public projectId:string;
    public gridType:GridType;
    public masterGridColumns:GridColumn[];
    public userGridColumns:GridColumn[];
}

export class GridColumn {
    public id: string;
    public columnName: string;
    public sequence: number;
    public title:string;
    public removable:boolean;
    public editable:boolean;
    public type: string;
    public component:string;
}

export enum GridType
{
    Deliverable
}

export class Pagination
{
    pageIndex:number;
    pageSize:number;
    searchText?:string;
}

export class DeliverableReportRequestModel extends Pagination
{
    projectId:string;
}


