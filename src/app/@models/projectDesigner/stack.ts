import { BlockType, BlockState } from './block';
import { LibraryReferenceViewModel } from './library';
import { TransactionTypeDataModel } from '../transaction';
import { BlockTypeDataModel, BlockStatusDataModel, BlockIndustryDataModel } from './common';

export class StackLevelViewModel {
    id: string;
    stackLevel: string;
}

export class UserAssignmentDataModel {
    assignedTo: string;
    assignedOn: string;
    submittedOn: string;
    submittedTo: string;
}

export class BlockReferenceViewModel {
    id: string;
    level: number;
    previousId: string;
    parentId: string;
    nextId: string;
    blockId: string;
    isDeleted: boolean;
    isRemoved: boolean;
    hasChildren: boolean;
    isStack: boolean;
    stackId: string;
    userAssignmentDataModel: UserAssignmentDataModel
}

export class StackRequestViewModel {
    id: string;
    isStack: boolean;
    isCopy: boolean;
    previousId: string;
    parentId: string;
    title: string;
    description: string;
    blockType: BlockType;
    stackLevel: StackLevelViewModel;
    transactionType: TransactionTypeDataModel;
    blockOrigin: string;
    blocks: BlockReferenceViewModel[];
    libraryReference: LibraryReferenceViewModel;
}

export class TemplateStackUngroupModel {
    previousId: string;
    stackId: string;
    templateId: any;
    projectId: string;
    deliverableId: string;
    //TODO: Check if nextId is being used, else remove it
    nextId: any;
    templateUid:string;
    stackUid:string;
    deliverableUid:string;
}

export class LibraryStackUngroupModel {
    previousId: string;
    stackId: string;
    templateId: any;
    projectId: string;
    deliverableId: string;
    nextId: any;
    IsGlobal: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsCountryTemplate: boolean;
    stackrefrenceId: string;
}

export class StackAttributeDetail {
    id: string;
    transactionType: TransactionTypeDataModel;
    description: string;
    blockType: BlockType;
    stackLevel: StackLevelViewModel;
    //Added for concurrency
    uId:string;
}

export class StackAttributeViewModel {
    stackLevel: StackLevelViewModel[];
    stackType: BlockType[];
    transactionType : TransactionTypeDataModel[];
}

export class UpdateStackAttributeDetails{
    id : string;
    stackLevel : StackLevelViewModel;
    transactionType : TransactionTypeDataModel;
    description : string;
    title:string;
    blockType : BlockType;
    industry: BlockIndustryDataModel[];
    projectYear : number;
    blockStatus : BlockStatusDataModel;
    blockState:BlockState;
    templatesUtilizedIn : string;
    uId:string;
    templateId:string;
    templateUId:string;
    entityUId:string;
    entityId:string;
}
export class CheckConcurrencyRequestModel {
    source: CheckConcurrencySourceRequestModel;
    destination: CheckConcurrencyDestinationRequestModel;
}
export class CheckConcurrencySourceRequestModel {
    sourceBlocks: BlockReferenceViewModel[];
    sectionId: string;
    section: string;
}
export class CheckConcurrencyDestinationRequestModel {
    destinationBlocks: BlockReferenceViewModel[];
    sectionId: string;
    section: string;
}