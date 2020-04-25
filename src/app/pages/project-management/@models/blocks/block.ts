import { BlockType, BlockStatus } from "../../../../@models/projectDesigner/block";

export class BlockRequestModel {

    entityId: string;
    templateId: string;
    projectId: string;
    comment: string;
    blockReferenceId: string;
    parentStackId: string;
    blockReportFilterRequest: BlockReportFilterRequest;
    SearchText: string;
}

export class BlockReportFilterRequest {
    BlockType: string[];
    BlockStatus: string[];
    UserAssignment: string[];
    MinDueDate: string;
    MaxDueDate: string;
}


export class BlockResponseModel {
    id: string;
    previousId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    title: string;
    hasChildren: boolean;
    description: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    colorCode: string;
    comment: string;
    blocks: BlockResponseModel[];
    userAssignment: UsersAssignment;
}


export class UsersAssignment {
    fullName: string;
    dueDate: string;
}

export interface BlockFilterResponse {
    blockType: blockType[];
    blockStatus: blockStatus[];
    deliverable: Deliverable[];
    maxDueDate: string;
    minDueDate: string;
    userAssignment: userAssignment[];
    template: Template[];
}

export interface blockType {
    blockTypeId: string;
    blockType: string;
}

export interface userAssignment {
    assignedTo: string;
    fullName: string;
}

export interface Template {
    id: string;
    name: string;
    checked: boolean;
}

export interface Deliverable {
    id: string;
    name: string;
    checked: boolean;
}

export interface blockStatus {
    blockStatusId: string;
    blockStatus: string;
}


export class BlockReportFlatNode {

    id: string;
    previousId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    title: string;
    hasChildren: boolean;
    description: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    colorCode: string;
    comment: string;
    blocks: BlockResponseModel[];
    userAssignment: UsersAssignment;
    expandable: boolean;
    nodeIndex: number;
    level: number;
}


export class BlockReportItemNode {
    id: string;
    previousId: string;
    blockId: string;
    parentId: string;
    isStack: boolean;
    title: string;
    hasChildren: boolean;
    description: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    colorCode: string;
    comment: string;
    userAssignment: UsersAssignment;
    expandable: boolean;
    nodeIndex: number;
    level: number;
    blocks: BlockReportItemNode[];
}

export class BlockTitleViewModel {
    id: string;
    title: string;
    description: string;
    documentTitle: string;
    titleFormatApplied : boolean;
    titleTrackChanges : string = null;
    titleCommentThreads : string = null;
    isAdmin : boolean = false;
    uId:string;
}