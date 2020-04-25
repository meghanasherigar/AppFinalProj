import { LibraryReferenceViewModel } from './library'
import { TransactionTypeDataModel } from '../transaction';
import { UserAssignmentDataModel } from './stack';
import { TemplateViewModel } from './template';

export class BlockState {
    blockStateId: string;
    blockState: string;
}

export class BlockStatus {
    blockStatusId: string;
    blockStatus: string;
}

export class BlockType {
    blockTypeId: string;
    blockType: string;
    Id: string;
}

export class BlockAttribute {
    blockState: BlockState[];
    blockStatus: BlockStatus[];
    blockType: BlockType[];
    industry: Industry[];
    transactionType: TransactionTypeDataModel[];
}

export class BlockRequest {
    id: string;
    blockId: string;
    isStack: boolean;
    isCopy: boolean;
    isNew: boolean;
    title: string;
    description: string;
    otherIndustry: string;
    previousId: string;
    parentId: string;
    industry: Industry[];
    blockType: BlockType;
    blockOrigin: string;
    blockContent: string;
    displayBlockContent: string;
    blockState: BlockState;
    blockStatus: BlockStatus;
    hasChildren: boolean;
    libraryReference: LibraryReferenceViewModel;
    transactionType: TransactionTypeDataModel;
    parentUId?: string;
    footNotes: BlockFootNote[] = [];
    templatesUtilizedIn:string;
}

export class BlockPublish {
    global: boolean;
    isPublished: number;
    countryId: string;
    IsCountryTemplate: boolean;
    IsGlobalTemplate: boolean;
    IsCountry: boolean;
    IsGlobal: boolean;
}
export class BlockFootNote {
    blockId: string;
    id: string;
    referenceTag: string;
    text: string;
    index: number;
    symbol: string;
    footNotesTrackChanges: string = null;
    footNotesCommentThreads: string = null;
}
export class FootNoteRequestiewModel {
    blockId: string;
    footNotes: BlockFootNote;
}

export class Industry {
    id: string;
    industryName: string;
    subIndustries: SubIndustry[];
}

export class SubIndustry {
    id: string;
    subIndustry: string;
}
export enum DragDropSection {
    Library,
    Template,
    Deliverable,
    CBC,
}

export enum ActionType {
    DragBlock,
    DragBlockToStack,
    DragBlockOutOfStack,
    DragBlockStackToStack,
    DragMixBlockToStack
}

export class DragDropRequestViewModel {
    source: DragDropSection;
    destination: DragDropSection;
    action: ActionType;
    reorderWithinStack: boolean;
    dragDropList: BlockRequest[];
    libraryReference: LibraryReferenceViewModel;
    blockToMultipleEntities: string[];
    SourceStackId: string;
    DestinationStackId: string;
    SourceStackUId: string;
    DestinationStackUId: string;
}

export class TemplateBlockDetails {
    template: TemplateViewModel;
    blocks: BlockDetailsResponseViewModel[];
}

export class BlockDetailsResponseViewModel {
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
    blocks: BlockDetailsResponseViewModel[];
    UsersAssignment: UserAssignmentDataModel[];
    uId: string;
    blockTypeId: string;
    blockType: BlockType;
}

export class LibraryBlockDetails {
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
    userName?: string;
    suggestionDate?: string;
    suggestedUserEmailId?: string;
    uId: string;
    libraryUId: string;
    libraryId: string;
    isLocked: boolean;
    blockUser: UserAssignmentDataModel;
    parentUId?: string;
}
export class BlockBasicDetails {
    blockId: string;
    content: string;
    title: string;
    blockTypeId: string;
    description: string;
}

export class QuestionsBlockTypeDetails {
    blockType: BlockType;
    numberOfQuestions: number;
    numberOfAnswers: number;
}
export class BlockDetails {
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
    parentId: string;
    nodeIndex: number;
    hasChildren: boolean;
    isRemoved: boolean;
    indentation: string;
    usersAssignment: UserAssignmentDataModel[];
    colorCode: string;
    blockType: BlockType;
    blockStatus: BlockStatus;
    uId: string;
    parentUId?: string;
    isReference: boolean;
    isLocked: boolean;
    blockUser: UserAssignmentDataModel;
}

export class baseAuditTrail {
    createdBy: userBasicModel;
    createdOn: string;
    updatedBy: userBasicModel;
    updatedOn: string;

}
export class userBasicModel {
    firstName: string;
    lasttName: string;
    email: string;
}

export class BlockAttributeDetail extends baseAuditTrail {
    title: string;
    description: string;
    industry: Industry[];
    blockType: BlockType;
    blockStatus: BlockStatus;
    blockOrigin: string;
    projectYear: string;
    content: string;
    transactionType: TransactionTypeDataModel;
    blockState: BlockState;
    stackLevel: StackLevelViewModel;
    trackChangesSuggestions: any = null;
    commentThreads: any = null;
    isLocked: boolean;
    uId: string;
    footNotes: BlockFootNote[] = [];
    contentFormatApplied: boolean;
    titleFormatApplied: boolean;
    documentTitle: string;
}
export class StackLevelViewModel {
    id: string;
    stackLevel: string;
}

export class BlockAttributeRequest {
    blockId: string;
    title: string;
    description: string;
    industry: Industry[];
    blockType: BlockType;
    blockStatus: BlockStatus;
    content: string;
    transactionTYpe: TransactionTypeDataModel;
    //Added for concurrency check
    uId: string;
    colorCode: string;
    projectId: string;
    entityId: string;
    trackChangesSuggestions: any = null;
    commentThreads: any = null;
    templateId: string;
    templateUId: string;
    entityUId: string;
    isPageBreak: boolean;
    contentFormatApplied: boolean;
}
export class StackLevelDataModel {
    id: String;
    stackLevel: string;
}
export class BlockFilterDataModel {
    //TODO: Correct the case to map as per API response &
    // Also check if this model is referenced elsewhere
    Id: String;
    title: String[];
    description: String[];
    industry: Industry[];
    blockType: BlockType[];
    blockOrigin: string[];
    blockState: BlockState[];
    blockStatus: BlockStatus[];
    projectYear: number[];
    BlockCreator: String[];
    isStack: boolean;
    stackLevel: StackLevelDataModel[];
    Blocks: BlockRequest[];
    transactionType: TransactionTypeDataModel[];

    // stackFilter:StackModelFilter;
}

export class templateFilterRequest {
    IsTemplate: boolean;
    TemplateId: string;
}

export class deliverableFilterRequest {
    IsDeliverable: boolean;
    DeliverableId: string;
    EntityId: string;
}

export class OrganizationDataModel {
    OrganizationId: string;
    OrganizationName: string;
}
export class BlockFilterRequestDataModel {
    TemplateId: string;
    ProjectId: string;
    Organization: OrganizationDataModel[];
    Global: boolean;
    blockFilterData: BlockFilterDataModel;
    stackFilter: StackModelFilter;
}
export class DeliverableRequestViewModel {
    EntityId: string;
    TemplateId: string;
    ProjectId: string;
    Organization: OrganizationDataModel[];
    Global: boolean;
    blockFilterData: BlockFilterDataModel;
    stackFilter: StackModelFilter;
}
export enum ActionOnBlockStack {
    unGroupTemplate,
    unGroupDeliverable,
    unGroupLibrary,
    promote,
    demote,
    copyToLibrary,
    delete,
    cancelFilter,
    userRights
}

export enum LibraryOptions {
    "Globallibrary" = "Global Library",
    "Countrylibrary" = "Country Library",
    "OECDtemplates" = "Global OECD Template",
    "Countrytemplates" = "Country Template"
}


export enum blockColors {
    Teal = "Teal",
    White = "White",
    Grey = "Grey"
}
export class BlockStackViewModel {
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
    libraryReference: LibraryReferenceViewModel;
    transactionType: string;
    stackLevel: StackType;
    blocks: BlockReferenceViewModel[];
    hasChildren: boolean;
    parentUId: string;
}

export class StackType {
    Id: string;
    stackLevel: string;
}

export class BlockReferenceViewModel {
    id: string;
    blockId: string;
    previousId: string;
    nextId: string;
    level: number;
    UserAssignmentDataModel: UserAssignmentViewModel;
    isDeleted: boolean;
    isRemoved: boolean
}

export class UserAssignmentViewModel {
    assignedTo: string;
    assignedOn: string;
    submittedTo: string;
    submittedOn: string;
}
export class AssignToUsersDataModel {
    userIds: string[] = [];
    blockIds: string[] = [];
    note: string;
    sectionId: string;
    section: string;
    dueDate: Date;
    AssignAll: boolean;
}
export class projectIcons {
    disableIconF: boolean = false;
    //Block creation should be enabled irrespective of block-selection
    disableIconCreate: boolean = true;
    disableIconAs: boolean = false;
    disableIconSe: boolean = false;
    disableIconDe: boolean = false;
    disableIconP: boolean = false;
    disableIconC: boolean = false;
    disableIconR: boolean = false;
    disableIconAtt: boolean = false;
    disableIconCopy: boolean = false;
    disableIconCS: boolean = false;
    disableIconUS: boolean = false;
    disableIconA: boolean = false;
    disableIconL: boolean = false;
    disableIconAssignAll: boolean = false;
    disableSelectAll: boolean = false;
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
    lockedBlockSelected: boolean = false;
}

export class SelectedFilter {
    selectedFilterProjectYear = [];
    selectedFilterblockStatus = [];
    selectedFilterblockOrigin = [];
    selectedFiltertitle = [];
    selectedFilterBlockCreator = [];
    selectedFilterblockState = [];
    selectedFilterindustry = [];
    selectedblockType = [];
}
export class StackModelFilter {
    level: string[];
    stackType: string[];
    transactionType: TransactionTypeDataModel[];
}

export class DocumentViewIcons {
    enableSave: boolean = false;
    enableGenerate: boolean = false;
    //Block creation should be enabled irrespective of block-selection
    enableCreateBlock: boolean = true;
    enableCreateStack: boolean = false;
    enableUnStack: boolean = false;
    enableAttributes: boolean = false;
    enableCopy: boolean = false;
    enablePaste: boolean = false;
    enableRemove: boolean = false;
    enableLinkTo: boolean = false;
    enableAddToLibrary: boolean = false;
    enablePromote: boolean = false;
    enableDemote: boolean = false;
    enableBlockStaff: boolean = false;
    enableSuggestForLib: boolean = false;
    enableFormatting: boolean = false;
    enableEditAttribute: boolean = false;
    enableNavigationPane: boolean = false;
    enableCoverPage: boolean = false;
    enablePageBreak: boolean = false;
    enableSectionBreak: boolean = false;
    enableTables: boolean = false;
    enablePictures: boolean = false;
    enableHyperLinks: boolean = false;
    enableShapes: boolean = false;
    enableCrossReference: boolean = false;
    enableHeadersAndFooters: boolean = false;
    enablePageNumber: boolean = false;
    enableFootNote: boolean = false;
    enableTableofContent: boolean = false;
    enableAbbreviation: boolean = false;
    enableTimeStamp: boolean = false;
    enableSymbol: boolean = false;
    enableMargins: boolean = false;
    enableSize: boolean = false;
    enableOrientation: boolean = false;
    enableColumns: boolean = false;
    enableRuler: boolean = false;
    enablePageBorder: boolean = false;
    enableColor: boolean = false;
    enablePageSize: boolean = false;
    enableWaterMark: boolean = false;
    enableStylePanel: boolean = false;
    enableCreateQuestions: boolean = false;
    enableImportTransactions: boolean = false;
    enableStyleSection: boolean = false;
    enableIndentation : boolean = false;
    enableParagraphSpacing: boolean = false;
}

export const importerProcessSteps = [
    { id: 1, path: "info-status", name: "Select block(s)" },
    { id: 2, path: "info-settings", name: "Block Attributes" },
]

export class cssStyles {
    key: string;
    value: any;
}

export const PageBorder =
{
    borderStyles: [] = [
        '0.5px solid rgb(0,0,0)',
        '1px dotted rgb(0,0,0)',
        '1px dashed rgb(0,0,0)',
        '1px double rgb(0,0,0)',
        '3px double rgb(0,0,0)',
    ],
    widthStyles: [] = [
        '0.333px',
        '0.666px',
        '1px',
        '1.333px',
        '2px',
        '3px',
        '4px',
        '6px',
        '8px'
    ],
    borderTypes: [] = [
        'top',
        'left',
        'right',
        'bottom'
    ]
};

export class Guid {
    static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export enum ParagraphSpacing {
    Firstline = 'First line',
    center = 'center',
    Hanging = 'Hanging',
    left = 'left',
    Single = 'Single',
    SingleValue = '1.37em',
    SingleAndHalf = '1.5 lines',
    SingleAndHalfValue = '2.05em',
    Double = 'Double',
    DoubleValue = '2.74em',
    Atleast = 'At least',
    AtleastValue = '1.5em',
    Exactly = 'Exactly',
    ExactlyValue = '1.8em',
    Multiple = 'Multiple',
    MultipleValue = 2,
    DefalutMarginnValue = '0px',
}
export enum BlockImporter {
    HRTag = "hr",
    HREF = "href",
    FootNoteRef = "#_ftnref",
    AnchorTag = "a",
    FootNoteId = "_ftn",
    ParseType = "text/xml",
    DivTag = "div",
    CheckBoxId = "checkbox_",
    SpanTag = "span",
    Templafy = "templafy",
    Style = "style",
    FileExtPDF = "pdf",
    SpanQuerySelector = "span[id*='#']",
    IdAttribute ="id",
    FigureQuerySelector="figure[id*='#']",
    TableQuerySelector= "table[id*='#']",
    CkEditorBaloonPanel = "ck-balloon-panel",
    HideElement = "display:none",
    DisplayStyleAttribute = "display",
    DisplayNoneValue = "none",
    TableTag = "table",
    TdTag = "td",
    ContentEditable = "contentEditable",
    PointerEvents = "pointerEvents",
    ColorYellow = "yellow",
    BackGroundColor = "backgroundColor",
    HTMLTag  = "html",
    BodyTag = "body"
}

export enum CrossReference {
    spanTagId = 'spanTagId',
    bold = 'bold',
    boldValue = 'font-weight: bold;',
    italic = 'italic',
    italicValue = 'font-style: italic;',
    underline = 'underline',
    underlineValue = 'text-decoration: underline;',
    strikethrough = 'strikethrough',
    strikethroughValue = 'text-decoration: line-through;',
    superscript = 'superscript',
    superscriptValue = 'vertical-align: super;',
    fontColor = 'fontColor',
    color = 'color:',
    fontBackgroundColor = 'fontBackgroundColor',
    backgroundColor = 'background-color:',
    fontFamily = 'fontFamily',
    fontFamilyValue = 'font-family:',
    fontSize = 'fontSize',
    fontSizeValue = 'font-size:',
}

export enum LineSpaceRule {
    AtLeast = 0,
    Exactly = 1,
    Multiple = 2
}

export enum IndententLevelEnum {
    Alphabet = 0,
    Number = 1,
    Roman = 2
}

export const IndententLevel = {
    Alphabet : 'Alphabet',
    Roman : 'Roman',
    Number : 'Number'
}

export class TemplateDeliverableRequestModel {
    BlockId: string;
    TemplateOrDeliverableId : string;
    IsTemplate: boolean;
}

