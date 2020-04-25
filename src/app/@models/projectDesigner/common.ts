import { Alignment } from './report';
import * as moment from 'moment';


export enum regions { none, library, deliverables, templates }
export class viewAttributeModel {
    regionType: regions;
    data: string;
}

export class PaginationViewModel {
    PageIndex: number;
    PageSize: number;
}

export class BlockIndustryDataModel {
    Id: string;
    IndustryName: string;
    SubIndustries: Array<BlockSubIndustryDataModel>;
}

export class BlockSubIndustryDataModel {
    Id: string;
    SubIndustry: string;
}

export class BlockStatusDataModel {
    BlockStatusId: string;
    BlockStatus: string;
}

export class BlockTypeDataModel {
    BlockTypeId: string;
    BlockType: string;
}

export class BlockStateDataModel {
    BlockStateId: string;
    BlockState: string;
}

export class SearchRequestViewModel extends PaginationViewModel {
    searchText?: string;
}


export class SuggestForLibraryViewModel {
    Id: string;
    ProjectId: string;
    EntityId: string;
    SuggestTo: UserRolesViewModel;
    Comments: string;
    SuggestedBlocks: SuggestedBlockViewModel[];
}

export class UserRolesViewModel {
    IsGlobalAdmin: boolean = null;
    IsCountryAdmin: boolean = null;
}

export class SuggestedBlockViewModel {
    BlockId: string;
    IsAccepted: boolean = null;
}

export class GenericResponseModel {
    isSuccessful: boolean;
    responseType: string;
    errorMessages: string[];
}
export enum LibraryEnum {
    global = "global",
    country = "country",
    organization = "organization",
    user = "user",
    blocks = "blocks",
    globaloecd = "globaloecd",
    countrytemplate = "countrytemplate"
}
export enum LibrarySectionEnum {
    global = 1,
    country = 2,
    organization = 3,
    user = 4,
    blocks = 5,
    globaloecd = 6,
    countrytemplate = 7
}

export class BlockUserRightReqViewModel {
    ProjectId: string
    EntityId: string
    BlockId: string
}

// export class BlockStaffingResponseViewModel {
//     userRights: BlockStaffingGridViewModel[];
//     totalCount: number;
// }

export class BlockUserRightViewModel {
    ProjectID: string;
    EntityId: string;
    BlockID: string;
    UserID: string;
    UserFirstName: string;
    UserLastName: string;
    UserEmail: string;
    IsRemove: boolean;
    IsCopy: boolean;
    IsEdit: boolean;
    //IsCreator: boolean;
}


export class BlockStaffingGridViewModel {
    projectID: string;
    entityId: string;
    blockID: string;
    userID: string;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    isRemove: boolean;
    isCopy: boolean;
    isEdit: boolean;
    //isCreator: boolean;
}

export class HeaderFooterViewModel {
    Id: string;
    ProjectId: string;
    TemplateOrDeliverableId: string;
    Content: string;
    ContentType: string;
    IsTemplate: boolean;
    HeaderTrackChanges: string = null;
    HeaderCommentThreads: string = null;
    FooterTrackChanges: string = null;
    FooterCommentThreads: string = null;
    IsRemoved: boolean = false;
}

export class WaterMarkViewModel {
    Id: string;
    ProjectId: string;
    TemplateOrDeliverableId: string;
    Content: string;
    ContentType: string;
    IsTemplate: boolean;
    waterMark: waterMarkProp;
}

export class MarginViewModel {
    Id: string;
    ProjectId: string;
    TemplateOrDeliverableId: string;
    Content: string;
    ContentType: string;
    IsTemplate: boolean;
    Margin: marginProp;
}

export class marginProp {
    Top: string;
    Bottom: string;
    Left: string;
    Right: string;
    MarginType: string;
}
export class waterMarkProp {
    FontSize: string;
    FontName: string;
    Text: string;
    Alignment: Alignment;
}
export class waterMarkPropFormGroup {
    FontSize: string;
    FontName: string;
    Text: string;
    Orientation: string;
}
export class EditorInfo {
    Index: number;
    rootName: string;
    footNoteId: string;
}
export class HeaderFooterResponseViewModel {
    header: GetHeaderFooterViewModel;
    footer: GetHeaderFooterViewModel;
}
export class WaterMarkResponseViewModel {
    WaterMark: WaterMarkViewModel;
}
export class GetHeaderFooterViewModel {
    id: string;
    projectId: string;
    templateOrDeliverableId: string;
    content: string;
    contentType: string;
    isTemplate: boolean;
    footerTrackChanges: string = null;
    footerCommentThreads: string = null;
    headerTrackChanges: string = null;
    headerCommentThreads: string = null;
}

export class AddToLibrary {
    checkbox1: boolean;
    checkbox2: boolean;
}

export class OrganizationLibraryRequestViewModel {
    BlockIds: [];
    OrganizationId: string;
    ProjectId: string;
    EntityId: string;
}

export class AddToUserLibraryModel {
    Blocks: [];
    DeliverableId: string;
    ProjectId: string;
}

export enum FullViewDefault {
    deliverable = "deliverable",
    template = "template"
}
export class AbbreviationViewModel {
    Id: string;
    Abbreviation: string;
    FullForm: string;
    ProjectId: string;
    TemplateOrDeliverableId: string;
    IsTemplate: boolean;
    isGlobalOecdTemplate: boolean;
    isCountryOecdTemplate: boolean;
    Ids : string[];
}
export class SearchAbbreviationViewModel extends SearchRequestViewModel {
    abbreviationId?: string;
    projectId?: string;
}

export class RightClickOptionsModel {
    enableCreate: boolean;
    enableCopy: boolean;
    enableAddToLibrary: boolean;
    enableAssignTo: boolean;
    enableRemove: boolean;
    enableLinkTo: boolean;
}
export class FootNoteSymbolMasterViewModel
{
    id: string;
    symbol: string;
    symbolNumber: number;
}
export enum ActionEnum {
    find = 'Find',
    Find = 'find',
    findAgain = 'findagain',
    replace = "Replace",
    findNext = 'FindNext',
    replaceSelected = 'ReplaceSelected',
    findPrevious = 'FindPrevious',
    saveAll = 'saveAll',
    scrollToBlock = 'scrollToBlock',
    reload = 'reload',
    reloadEditor = "reloadEditor",
    noWaterMark = 'NoWaterMark',
    deleteHeader = 'DeleteHeader',
    header = 'Header',
    deleteFooter = 'DeleteFooter',
    footer = 'Footer',
    typeSomething = '[Type Something]',
    blockactive = 'block-active',
    parentDiv = 'parentDiv',
    insertTable = 'InsertTable',
    cancel = 'Cancel',
    InsertTable = 'InsertTable',
    loadSelectedTheme = 'LoadSelectedTheme',
    created = 'created',
    toggleblockattributecomponent = 'toggleblockattributecomponent'
}
export enum HeaderTypeEnum {
    headerType1 = 'HeaderType1',
    headerType2 = 'HeaderType2',
    headerType3 = 'HeaderType3'
}
export enum FooterTypeEnum {
    footerType1 = 'FooterType1',
    footerType2 = 'FooterType2',
    footerType3 = 'FooterType3'
}

export enum MarginTypes {
    normal = 'Normal',
    narrow = 'Narrow',
    wide = 'Wide',
    custom = 'Custom',
    moderate = 'Moderate'
}
export class ApproveRejectViewModel {
    IsApproved: boolean = false;
    IsRejected: boolean = false;
}
export enum EditorNamesPrefix {
    header = 'header-',
    footNote = 'footNote-',
    footNoteToBeReplace = '</sup>&nbsp;</p>',
    replaceWith = '<span> </span><span>&nbsp;</span></p>',
    replaceWithJustSpace = "<span> </span><span>&nbsp;</span>",
    tableExtraSpace = "</figure><p>&nbsp;</p>",
    replaceWithForTable = "</figure>",
    lengthOfSpaceSpan = 33

}

export const TimeStampLists = [
    moment().local().format('MM/DD/YYYY'),
    moment().local().format('MMMM DD,YYYY'),
    moment().local().format('MM/DD/YY'),
    moment().local().format('YYYY-MM-DD'),
    moment().local().format('DD-MMM-YY'),
    moment().local().format('MM.DD.YYYY'),
    moment().local().format('MMM. DD, YY'),
    moment().local().format('DD MMMM YYYY'),
    moment().local().format('MMMM YY'),
    moment().local().format('MMM-YY'),
    moment().local().format('MM/DD/YYYY hh:mm a'),
    moment().local().format('MM/DD/YYYY hh:mm:ss a'),
    moment().local().format('hh:mm a'),
    moment().local().format('hh:mm:ss a'),
    moment().local().format('HH:mm'),
    moment().local().format('HH:mm:ss'),

];
export const Symbols: string[] = ['&#8361;', '&#8355;', '&#x20AC;', '&#8356;', '&#8359;', '&#x20B9;', '&#8372;', '&#8367;', '&#8366;',
    '&#8368;', '&#8370', '&#8369', '&#8371;', '&#8373;', '&#8365;', '&#8362;', '&#8363',
    '&#33;', '&#34;', '&#35;', '&#36;', '&#37;', '&#38;', '&#39;', '&#40;', '&#41;', '&#42;', '&#43;', '&#44;', '&#45;', '&#46;',
    '&#47;', '&#48;', '&#49;', '&#50;', '&#51;', '&#52;', '&#53;', '&#54;', '&#55;', '&#56;', '&#57;', '&#58;', '&#59;', '&#60;', '&#61;',
    '&#62;', '&#63;', '&#64;', '&#65;', '&#66;', '&#67;', '&#68;', '&#69;', '&#70;', '&#71;', '&#72;', '&#73;', '&#74;', '&#75;', '&#76;',
    '&#77;', '&#78;', '&#79;', '&#80;', '&#81;', '&#82;', '&#83;', '&#84;', '&#85;', '&#86;', '&#87;', '&#88;', '&#89;', '&#90;', '&#91;',
    '&#92;', '&#93;', '&#94;', '&#95;', '&#96;', '&#97;', '&#98;', '&#99;', '&#100;', '&#101;', '&#102;', '&#103;', '&#104;', '&#105;', '&#106;',
    '&#107;', '&#108;', '&#109;', '&#110;', '&#111;', '&#112;', '&#113;', '&#114;', '&#115;', '&#116;', '&#117;', '&#118;', '&#119;', '&#120;', '&#121;',
    '&#122;', '&#123;', '&#124;', '&#125;', '&#126;', '&#128;', '&#130;', '&#131;', '&#132;', '&#133;', '&#134;', '&#135;', '&#136;',
    '&#137;', '&#138;', '&#139;', '&#140;', '&#142;', '&#145;', '&#146;', '&#147;', '&#148;', '&#149;', '&#150;', '&#151;',
    '&#152;', '&#153;', '&#154;', '&#155;', '&#156;', '&#158;', '&#159;', '&#161;', '&#162;', '&#163;', '&#164;', '&#165;', '&#166;',
    '&#167;', '&#168;', '&#169;', '&#170;', '&#171;', '&#172;', '&#174;', '&#175;', '&#176;', '&#177;', '&#178;', '&#179;', '&#180;', '&#181;',
    '&#182;', '&#183;', '&#184;', '&#185;', '&#186;', '&#187;', '&#188;', '&#189;', '&#190;', '&#191;', '&#192;', '&#193;', '&#194;', '&#195;', '&#196;',
    '&#197;', '&#198;', '&#199;', '&#200;', '&#201;', '&#202;', '&#203;', '&#204;', '&#205;', '&#206;',
    '&#207;', '&#208;', '&#209;', '&#210;', '&#211;', '&#212;', '&#213;', '&#214;', '&#215;', '&#216;', '&#217;', '&#218;', '&#219;', '&#220;', '&#221;',
    '&#222;', '&#223;', '&#224;', '&#225;', '&#226;', '&#227;', '&#228;', '&#229;', '&#230;', '&#231;', '&#232;', '&#233;', '&#234;', '&#235;', '&#236;',
    '&#237;', '&#238;', '&#239;', '&#240;', '&#241;', '&#242;', '&#243;', '&#244;', '&#245;', '&#246;', '&#247;', '&#248;', '&#249;', '&#250;', '&#251;',
    '&#252;', '&#253;', '&#254;', '&#255;'

];

export class DocumentConfigurationModel {
    id: string;
    projectId: string;
    templateOrDeliverableId: string;
    content: string;
    contentType: ContentTypeViewModel;
    isTemplate: boolean;
    border: BorderViewModel;
}

export enum ContentTypeViewModel {
    Header = 1,
    Footer = 2,
    Margine = 3,
    PageSize = 4,
    Orientation = 5,
    TemplateColumn = 6,
    Watermark = 7,
    PageColor = 8,
    PageBorder = 9,
    TableOfContent = 10,
    Indentation = 12
}

export class BorderViewModel {
    left: BorderView;
    right: BorderView;
    top: BorderView;
    bottom: BorderView;
    content: string;
}

export class BorderView {
    lineStyle: LineStyleViewModel;
    lineWidth: number;
    color: RGBColorViewModel;
}

export const BorderDetails = {
    lineStyle: 'lineStyle',
    lineWidth: 'lineWidth',
    color: 'color',
}

export enum LineStyleViewModel {
    none = 0,
    solid = 1,
    double = 3,
    dotted = 6,
    dashed = 8,
}
export class DocViewer {
    error: any;
    page: number = 1;
    rotation: number = 0;
    zoom: number = 1.0;
    originalSize: boolean = true;
    pdf: any;
    renderText: boolean = true;
    isLoaded: boolean = false;
    stickToPage: boolean = true;
    showAll: boolean = true;
    autoresize: boolean = true;
    fitToPage: boolean = false;
    outline: any[];
    isOutlineShown: boolean = true;
    pdfQuery: string = '';
}

export class RGBColorViewModel {
    r: number;
    g: number;
    b: number;
}

export const RGBColors = [
    {
        colorCode: '#ffffff',
        rgb: 'rgb(255, 255, 255)'
    },
    {
        colorCode: '#000105',
        rgb: 'rgb(0, 1, 5)'
    },
    {
        colorCode: '#3e6158',
        rgb: 'rgb(62, 97, 88)'
    },
    {
        colorCode: '#3f7a89',
        rgb: 'rgb(63, 122, 137)'
    },
    {
        colorCode: '#96c582',
        rgb: 'rgb(150, 197, 130)'
    },
    {
        colorCode: '#b7d5c4',
        rgb: 'rgb(183, 213, 196)'
    },
    {
        colorCode: '#bcd6e7',
        rgb: 'rgb(188, 214, 231)'
    },
    {
        colorCode: '#7c90c1',
        rgb: 'rgb(124, 144, 193)'
    },
    {
        colorCode: '#9d8594',
        rgb: 'rgb(157, 133, 148)'
    },
    {
        colorCode: '#dad0d8',
        rgb: 'rgb(218, 208, 216)'
    },
    {
        colorCode: '#4b4fce',
        rgb: 'rgb(75, 79, 206)'
    },
    {
        colorCode: '#4e0a77',
        rgb: 'rgb(78, 10, 119)'
    },
    {
        colorCode: '#a367b5',
        rgb: 'rgb(163, 103, 181)'
    },
    {
        colorCode: '#ee3e6d',
        rgb: 'rgb(238, 62, 109)'
    },
    {
        colorCode: '#d63d62',
        rgb: 'rgb(214, 61, 98)'
    },
    {
        colorCode: '#c6a670',
        rgb: 'rgb(198, 166, 112)'
    },
    {
        colorCode: '#f46600',
        rgb: 'rgb(244, 102, 0)'
    },
    {
        colorCode: '#cf0500',
        rgb: 'rgb(207, 5, 0)'
    },
    {
        colorCode: '#efabbd',
        rgb: 'rgb(239, 171, 189)'
    },
    {
        colorCode: '#8e0622',
        rgb: 'rgb(142, 6, 34)'
    },
    {
        colorCode: '#f0b89a',
        rgb: 'rgb(240, 184, 154)'
    },
    {
        colorCode: '#f0ca68',
        rgb: 'rgb(240, 202, 104)'
    },
    {
        colorCode: '#62382f',
        rgb: 'rgb(98, 56, 47)'
    },
    {
        colorCode: '#c97545',
        rgb: 'rgb(201, 117, 69)'
    },
    {
        colorCode: '#c1800b',
        rgb: 'rgb(193, 128, 11)'
    }
];

export class EditorFormatOptionsViewModel {
    suggestions : any = [];
    commentThreads : any = [];
    users : any = [];
}

export enum WatermarkSettings {
    Horizontal='Hoizontal',
    Clockwise = 'Clockwise',
    AntiClockwise = 'AntiClockwise',
    TopRight = 'TopRight',
    TopLeft = 'TopLeft',
    BottomLeft = 'BottomLeft',
    BottomRight = 'BottomRight',
    FontName = 'Verdana, sans-serif',
    FontSize = '100',
    Text = 'Deloitte',
    NoWatermark = 'nowatermark',
    noRotation = 'noRotation'

}