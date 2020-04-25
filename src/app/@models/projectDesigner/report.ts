import { UserSearchResult } from '../userAdmin';
import { BaseFilterViewModel } from '../common/commonmodel';

export class ReportRequest {
    templates: KeyValueViewModel[];
    deliverables: KeyValueViewModel[];
    blockIds: string[];
    waterMarkText: string;
    fileFormat: FileFormat;
    alignment: Alignment;
    projectId: string;
    isInternalUser : boolean;
    isPreview: boolean = false;
}
export class KeyValueViewModel {
    id: string;
    name: string;
    taxableYearEnd: string;
    layoutStyleId: string;
}
export class Alignment {
    orientation: Rotation;
    horizontalAlignment: HorizontalPosition;
    verticalAlignment: VerticalPosition;
}

export enum FileFormat {
    Docx = 20,
    Pdf = 40,
    Unknown = 0
}

export enum Rotation {
    RotationNone = 0,
    ClockWise40 = 1,
    AntiClockWise40 = 2
}

export enum HorizontalPosition {
    None = 0,
    Default = 0,
    Left = 1,
    Center = 2,
    Right = 3,
    Inside = 4,
    Outside = 5
}

export enum VerticalPosition {
    Inline = -1,
    None = 0,
    Default = 0,
    Top = 1,
    Center = 2,
    Bottom = 3,
    Inside = 4,
    Outside = 5
}


export class ReportHistoryFilterViewModel extends BaseFilterViewModel {
    projectId: string;
    templateOrDeliverableName: string[];
    taxableYearEndFrom: Date;
    taxableYearEndTo: Date;
    reportType: string[];
    status: string[];
    createdOnFrom: Date;
    createdOnTo: Date;

}
export class ReportHistoryFilterRequestViewModel extends ReportHistoryFilterViewModel {
    generatedBy: string[];
}
export class ReportHistoryFilterResponseViewModel extends ReportHistoryFilterViewModel {
    generatedBy: UserSearchResult[];
}
export class ReportHistoryViewModel {
    id: string;
    projectId: string;
    templateOrDeliverableName: string;
    taxableYearEnd: Date;
    reportType: string;
    status: string;
    fileName: string;
    isDeleted: boolean;
    createdOn: Date;
    createdBy: UserSearchResult;
}
export class DeleteReportHistoryRequestViewModel {
    reportIds: string[];
}
export class ReportDownloadRequestViewModel {
    fileNames: string[];
}
export enum ReportsRelated
{
    reportName  = "ReportName"
}