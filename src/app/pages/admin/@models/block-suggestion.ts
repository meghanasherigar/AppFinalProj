import { BlockDetailsResponseViewModel, BlockState } from '../../../@models/projectDesigner/block';
import { Industry } from '../../../@models/organization';
import { LibraryReferenceViewModel } from '../../../@models/projectDesigner/library';
import { TransactionTypeDataModel } from '../../../@models/transaction';

export class BlockSuggestion {
}


export const  AttributesOptions =
{
    'BlockAttributes': 'toggleblockattributecomponent',
    'StackAttributes': 'togglestackckattributecomponent'
}

export class LibraryBlockDetails {
    library: LibraryDropdownViewModel;
    blocks: BlockDetailsResponseViewModel[];
}

export class BlockSuggestionResponseModel {
    id: string;
    level: number;
    previousId: string;
    nextId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    isRemoved: boolean;
    title: string;
    description: string;
    isDeleted: boolean;
    indentation: string;
    isCategory: boolean;
    transactionType: TransactionTypeDataModel;
    blocks: BlockSuggestionResponseModel[];
    UsersAssignment: UserAssignmentDataModel[];
    blockTypeId: string;
    blockType: BlockType;
    userName: string;
    suggestionDate: string;
}

export class LibraryDropdownViewModel {
    id: number;
    name: string;
    isActive: boolean;
}

export enum LibraryOptions {
    "Globallibrary" = "Global Library",
    "Countrylibrary" = "Country Library",
    "OECDtemplates" = "Global OECD Template",
    "Countrytemplates" = "Country Template"
}

export function libraryOptions() {
    return [{ id: "5d847fe0693ec22a68ac44cd", name: "Global Library", isActive: true, isGlobal: true },
    { id: "5d848064693ec22a68ac44e9", name: "Country Library", isActive: true, isGlobal: false }];
}

export class TodoItemNode {
    id: string;
    level: number;
    previousId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    isRemoved: boolean;
    title: string;
    description: string;
    blocks: TodoItemNode[];
    hasChildren: boolean;
    indentation: string;
    IsPartOfstack: boolean;
    stackBlockId: string;
    colorCode: string;
    isCategory: boolean;
    usersAssignment: UserAssignmentDataModel[];
    blockType: BlockType;
    blockStatus: BlockStatus;
    userName?: string;
    suggestionDate?: string;
    suggestedUserEmailId?: string;
}

export class acceptBlockRequest {
    blockids: string[];
    libraryReference: libraryReference;
}

export class rejectBlockRequest {
    blockids: string[];
}

export class libraryReference {
    Global: boolean;
    GlobalTemplate: boolean;
    isCountryLibrary: boolean;
    CountryTemplate: boolean;
    organizationId: string;
    userId: string;
    countryId: string;

}

export class blockSelectedModel {
    isStack: boolean;
    blockSelectCount: number;
    stackCount: number;
    nodeLevel: number;
    previousId: string;
    nodeCount: number;
    isParentStack: boolean;
    BlockStackRemoveAllowed: boolean = true;
    canCreateStack: boolean = true;
}

export class UserAssignmentDataModel {
    assignedTo: string;
    assignedOn: string;
    submittedOn: string;
    submittedTo: string;
}

export class BlockType {
    blockTypeId: string;
    blockType: string;
    Id: string;
}

export class BlockStatus {
    blockStatusId: string;
    blockStatus: string;
}

export class TodoItemFlatNode {
    id: string;
    blockId: string;
    item: string;
    previousId: string;
    level: number;
    expandable: boolean;
    isStack: boolean;
    description: string;
    parentId: string;
    nodeIndex: number;
    hasChildren: boolean;
    isRemoved: boolean;
    indentation: string;
    IsPartOfstack: boolean;
    stackBlockId: string;
    isCategory: boolean;
    usersAssignment: UserAssignmentDataModel[];
    colorCode: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    isReference: boolean;
    userName?: string;
    suggestionDate?: string;
    suggestedUserEmailId?: string;
    uId:string;
    libraryUId:string;
    libraryId:string;
    isLocked:boolean;
    blockUser:UserAssignmentDataModel;
}


export class LibraryBlockDetail {
    blockId: string;
    description: string;
    expandable: boolean;
    id: string;
    isStack: boolean;
    IsPartOfstack: boolean = false;
    stackBlockId: string;
    item: string;
    level: number;
    previousId: string;
    isCategory: boolean;
    parentId: string;
    nodeIndex: number;
    hasChildren: boolean;
    isRemoved: boolean;
    indentation: string;
    usersAssignment: UserAssignmentDataModel[];
    colorCode: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    isReference: boolean;
    userName: string;
    suggestionDate: string;
    suggestedUserEmailId: string;
    uId:string;
    libraryUId:string;
    libraryId:string;
    isLocked:boolean;
    blockUser:UserAssignmentDataModel;
}

export class BlockRequest {
    id: string;
    blockId: string;
    isStack: boolean;
    isCopy: boolean;
    isNew: boolean;
    title: string;
    description: string;
    previousId: string;
    parentId: string;
    industry: Industry[];
    blockType: BlockType;
    blockOrigin: string;
    blockContent: string;
    blockState: BlockState;
    blockStatus: BlockStatus;
    hasChildren: boolean;
    libraryReference: LibraryReferenceViewModel;
    transactionType: TransactionTypeDataModel;
}
