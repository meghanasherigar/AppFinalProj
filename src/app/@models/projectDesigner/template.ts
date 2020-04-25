import { BlockDetailsResponseViewModel, BlockDetails } from './block';
import { BlockReferenceViewModel } from './stack';
import { inherits } from 'util';
import { PaginationViewModel, BlockIndustryDataModel, BlockTypeDataModel, BlockStatusDataModel, BlockStateDataModel, SearchRequestViewModel } from './common';
import { EntityViewModel, DeliverableDropDownResponseViewModel } from './deliverable';

export class TemplateResponseViewModel {
    templatesDropDown: TemplateViewModel[];
    templateDetails: TemplateInfoResponseViewModel;
}

export class TemplateViewModel {
    templateId: any;
    templateName: string;
    isDefault: boolean;
    projectId: string;
    pageIndex : number;
    pageSize: number;
    searchText: string;
    deliverableId: any;
    uId:string;
    automaticPropagation:boolean;
    layoutStyleId:string;
}
export class PageModel
{
    pageIndex : number;
    pageSize: number;
    searchText: string;
}
export class TemplateInfoResponseViewModel {
    blocks: BlockDetailsResponseViewModel[];
}

export class TemplateAndBlockDetails {
    template: TemplateViewModel;
    blocks: BlockDetailsResponseViewModel[];
    filterApplied?:boolean;
}

export class TemplateStackUngroupModel {
    //TODO: Check if prevId is being used
    previousId: string;
    stackId: string;
    templateId: any;
    projectId: string;
    deliverableId: string;
    nextId: any;
    templateUid:string;
    stackUid:string;
    deliverableUid:string;
}
export class TemplateBlockDemote{
    BlockDetail: BlockDetail[] = [];
    templateId: string;
    deliverableId: string;
    projectId: string;
    templateUid: string;
    deliverableUid: string;
}
export class BlockDetail{
    blockRefernceId: string;
    isStack: boolean;
    stackId: string;
    stackUid:string;
    previousId: string;
    parentId: string;
    blockIndex: number;
}
export class LinkToDeliverableRequestModel {
    blocks: BlockReferenceViewModel[];
    deliverableIds: string[];
    TemplateId: string;
    templateUid: string;
    ProjectId : string;
    groupDeliverableIds : string[];
}

export class TemplateDetailsRequestModel extends PaginationViewModel {
    templateId: string;
    projectId: String;
}
export class TemplateDetailsAnswerTagRequestModel
{
    templateOrDeliverableId: string;
    projectId: string;
    isTemplate: boolean;
}
export class TemplateDetailsResponseModel {
    id : string;
    level : number;
    previousId : string;
    blockId : string;
    parentId : string;
    isStack : boolean;
    isRemoved : boolean;
    title : string;
    hasChildren : boolean;
    description : string;
    blockType : BlockTypeDataModel;
    templatesUtilizedIn : string;
    transactionType : string;
    projectYear : number;
    blockStatus : BlockStatusDataModel;
    blockState : BlockStateDataModel;
    industry: BlockIndustryDataModel[];
    blockOrigin : string;
    creator : string;
    blocks : BlockDetailsResponseViewModel[];
}

export class SearchTemplateViewModel extends SearchRequestViewModel {
    templateId?: string;
    projectId?: string;
}

export class CreateTemplateRequest {
    templateId : string;
    templateName : string;
    templateDescription : string;
    projectId : string;
    projectName : string;
    associatedDeliverables : EntityViewModel[];
    isActive : boolean;
    automaticPropagation : boolean;
}

export class ImportTemplateRequest {
    TemplateId: string;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
}

export class TemplateDeliverableViewModel{
    templates: TemplateResponseViewModel[];
    deliverables: DeliverableDropDownResponseViewModel[];
}
export class LibraryDetailsRequestModel extends PaginationViewModel {
    organizationId: String;
    librarySections: number;
    IsAdmin: boolean;
}
export class BlocksTagsRequestModel {
    projectId: string;
    blockIds: string[] = [];
}
export class BlocksTagsResponseModel {
    blockId: string;
    blockTitle: string;
    answerTag: string;
    oldAnswerTag: string;
    isDuplicateTag: boolean;
}

export class TemplateDeleteRequestModel{
    TemplateIds: string[] = [];
    ProjectId: string;
}