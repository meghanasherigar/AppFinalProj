import { BaseFilterViewModel } from '../common/commonmodel';

export class DeliverableDataResponseViewModel {
    deliverableId: string;
    deliverableName: string;
    taxableYearEnd: string;
}

export class GetAppendixViewModel  extends BaseFilterViewModel{
    projectId: string;
}

export class AppendixDownloadRequestViewModel {
    fileName: string;
    uniqueFileName : string;
}

export class AppendixDeleteViewModel {
    ProjectId: string;
    blockId: string;
    AppendixIds : string[];
}

export enum ActionOnAppendix {
    download,
    delete
}

export class AssociateAppendixModel {
    projectId: string;
    AppendixIds: string[];   
    Deliverables : DeliverableDataResponseViewModel[];
}

export class DisassociateAppendixModel {
    projectId: string;
    AppendixId: string;
    blockId: string;
    Deliverables : DeliverableDataResponseViewModel[];
}

export class UpdateAppendixModel {
    projectId: string;
    AppendixId: string;
    AppendixName : string;
    Comment: string;
    blockId: string;
}