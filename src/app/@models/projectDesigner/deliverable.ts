import { BlockDetailsResponseViewModel } from './block';
import { SearchRequestViewModel, PaginationViewModel } from './common';
import { BaseFilterViewModel } from '../common/commonmodel';

export class DeliverableDropDownResponseViewModel {
    projectId: string;
    deliverableResponse: EntityViewModel[];
}


export class DeliverableCreateGroupRequestModel {
    projectId: string;
    templateId: string;
    name: string;
    description: string;
    projectYear: number;
    deliverables: EntityViewModel[];
    deliverableIds:Array<string>;
    //used in case of edit
    Id:string;
}

export class DeliverableGroupResponseModel {
    totalCount: number;
    group: DeliverableGroupViewModel;

}
export class DeliverableGroupViewModel {
    id: string;
    projectId: string;
    templateId: string;
    name: string;
    description: string;
    projectYear: number;
    deliverableIds: string[];
}

export class EntityViewModel extends PaginationViewModel {
    entityId: string;
    entityName: string;
    taxableYearEnd: string;
    templateId: string;
    templateName: string;
    milestone: string;
    deliverables: EntityViewModel[];
    countryName : string;
    countryCode: string;
    countryId : string;
    layoutStyleId : string;
}

export class DeliverableViewModel {
    id: string;
    deliverableId: string;
    deliverableName: string;
    entityId: string;
    templateId: string;
    projectId: string;
    templateName: string;
    uId: string;
    pushBackBlocks?: boolean;
    layoutStyleId : string;
}

export class DeliverablesInput {
    id: string;
    projectId: string;
    templateId: string;
    pageSize: number;
    pageInedx: number;
    templateName: string;
    deliverableName: string;
    pushBackBlocks?: boolean;
}

export class DeliverableResponseViewModel {
    id: string;
    projectId: string;
    templateId: string;
    templateName: string;
    entityId: string;
    IsDefault: boolean;
    blocks: BlockDetailsResponseViewModel[];
    uId: string;
    automaticPropagation: boolean;
    layoutStyleId : string
}

export class DeliverableChildNodes {
    id: string;
    blockid: string;
    isstack: string;
    indentation: string;
}

export class SearchDeliverableViewModel extends SearchRequestViewModel {
    entityId?: string;
    projectId?: string;
}
export const deliverableProperties = {
    'entityId': 'entityId',
    'entityName': 'entityName',
    'taxableYearEnd': 'taxableYearEnd'
}

export const deliverableGroupMessageTypes=
{
    'success':'success',
    'error':'error',
    'header':'header'
}

export class DeliverableMileStone {
    deliverableId: string;
    milestone: string;
    templateId?:string;
    automaticTemplate? : boolean;
    templateAssociationRequired? : boolean;
    automaticToManual?: boolean;
}
    
export class deliverableGroupFilter extends BaseFilterViewModel{
    deliverableFilter:DeliverableGroupInfo[];
    groupFilter:DeliverableGroupInfo[];
}

export class DeliverableGroupInfo{
    id:string;
    name:string;
}

export const AddDeliverableGroupSteps=[{id:1,name:"Step1"},{id:2,name:"Step2"}];
export const EditDeliverableGroupSteps=[{id:1,name:"Step1"},{id:2,name:"Step2"},{id:3,name:"Step3"}];

export class DeliverableGroupLinkToResponseViewModel {
    deliverableGroups: GroupLinkToResponseViewModel[];
    deliverables: EntityViewModel[];
}

export class GroupLinkToResponseViewModel extends PaginationViewModel {
    groupId: string; 
    projectId: string; 
    templateId: string; 
    groupName: string; 
    description: string; 
    projectYear: number; 
    deliverables: EntityViewModel[];
}

export class PageBorderStyles {
    border: string;
    borderColor: string;
    borderWidth: string;
    borderStyle: any;
}

export class BorderWidth {
    name: string;
    borderWidth: string;
}
