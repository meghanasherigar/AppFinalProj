import { BaseFilterViewModel } from './common/commonmodel';

export class ProjectUserRightViewModel {
    id: string;
    projectId: string;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    region:any= [];
    country:any= [];
    isCentralUser: boolean; 
    isLead: boolean;
    wasLead: boolean;
    entityRole: EntityRoleViewModel[];
    isExternalUser: boolean;
    lastActive: Date;
    status: string;
    userCountry: OtherCountryViewModel;
    projectTemplate: ProjectTemplateViewModel[];
  }

  export class CountryEntitySearchViewModel { 
    CountryIds: [];
    ProjectId: string;
}

export class RegionCountrySearchViewModel {
    regionIds: any = [];
    ProjectId: string;
}

export class RegionViewModel {
    RegionId: string;
    RegionName: string;
}

export class EditRegionViewModel {
    regionId: string;
    regionName: string;
}
  
export class EntityViewModel {
    EntityId: string;
    LegalEntityName: string;
    TaxableYearEnd : Date;
    fullName : string;
}

  
export class EditEntityViewModel {
    entityId: string;
    legalEntityName: string;
    taxableYearEnd: Date;
    fullName : string;
}
  
export class CountryViewModel {
    Id: string;
    Country: string;
    RegionId: string;
}

export class EditCountryViewModel {
    id: string;
    country: string;
    regionId: string;
}

export class OtherCountryViewModel {
    Id: string;
    CountryCode: string;
    CountryName: string;
    RegionId: string;
}

export class AuditTrailViewModel {
    createdBy: string;
    createdOn: string;
    updatedBy: Date;
    updatedOn: string;
}

export class UserAdminFilterRequestViewModel extends BaseFilterViewModel {
    ProjectId: string;
    ProjectUserIds: string[] = [];
    UserName: string[] = [];
    Role: string[] = [];
    Region: string[] = [];
    Country: string[] = [];
    CreatedBy: string[] = [];
    Entity: string[] = [];
    CreatedDateFrom: Date = null;
    CreatedDateTo: Date = null;
    Status: string[] = [];
}

export class ProjectUserFilterMenuDomainModel{
    userName: FilterDomainModel[];
    role: FilterDomainModel[];
    region: FilterDomainModel[];
    country: FilterDomainModel[];
    entity: FilterDomainModel[];
    createdBy: FilterDomainModel[];
    createdDateFrom: Date;
    createdDateTo: Date;
    status: FilterDomainModel[];
}

export class FilterDomainModel {
    id: string;
    name: string;
}

export class EntityRoleViewModel {
    entityId: string;
    entityName: string;
    taxableYearEnd: Date;
    read: boolean;
    copy: boolean;
    remove: boolean;
    formatting: boolean;
    edit: boolean;
    created: boolean;
    reArrange: boolean;
    reportGeneration: boolean;
}

export class ProjectTemplateViewModel{
    templateId: string;
    templateName: string;
}

// export class EditProjectTemplateViewModel{
//     TemplateId: string;
//     TemplateName: string;
// }

export class UserAdminResponseViewModel {
    projectUsers: UserAdminGridData[];
    totalCount: number;
}

export class UserAdminGridData {
    id: string;
    projectId: string;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    role: string;
    region: [];
    country: [];
    regionName: string;
    countryName: string;
    isCentralUser: boolean;
    isLead: boolean;
    isHidden: boolean;
    entityRole: EntityRoleViewModel[];
    entityRoleName: string;
    isExternalUser: boolean;
    lastActive: Date;
    status: string;
    createdBy: string;
    auditTrail: AuditTrailViewModel;
    projectTemplate: ProjectTemplateViewModel[];
    regionData : EditRegionViewModel[];
    countryData : EditCountryViewModel[];
    entityRoleData : EditEntityViewModel[];
}

export class SearchViewModel {
    Keyword: string;
}
export class SearchProjectIinternalUser{
    Keyword: string;
    SearchOption:number;
}

export class SearchProjectExternalUser{
    Keyword: string;
    ProjectId: string;
    SearchOption:number;
}

export class UserSearchResult {
    Id: string;
    firstName: string;
    lastName: string;
    email: string;
    AccountType:any;
    fullName: string;
}

export class AdminUserEventPayload {
    Action : string;
    UserAdminFilterModel : UserAdminFilterRequestViewModel;
}

export class InScope {
  checkbox1 : boolean;
  checkbox2: boolean;
}

export class InExternal {
  checkbox3 : boolean;
  checkbox4: boolean;
}

export class ProjectUserDeleteViewModel {
    ProjectId: string;
    UserIds = [];
}

export class EmailViewModel {
    ProjectId: string;
    EmailIds : any = [];
}

export class SendEmailViewModel {
    Id: string;
    SendTO: string[] = [];
    SendCC: string[] = [];
    SendBCC: string[] = [];
    Subject: string;
    BodyContent: string;
    IsProcessed: boolean = null;
}
export class InfoReqSendEmailViewModel {
    InformationRequestId: string;
    SentTo: UserBasicViewModel[] = [];
    CC: UserBasicViewModel[] = [];
    BCC: UserBasicViewModel[] = [];
    Subject: string;
    Content: string;
    EmailStatus: string;
    redirectUrlId: any;
}
export class UserBasicViewModel{
    FirstName:string;
    LastName:string;
    Email:string;
}

export class ForwardEmailViewModel {
    InformationRequestId: string;
    QuestionsId:QuestionIdsViewModel[]=[];
    EmailDetails:InfoReqSendEmailViewModel=new InfoReqSendEmailViewModel();
    TemplateOrDeliverableId: string;
    IsTemplate:boolean;
}
export class QuestionIdsViewModel{
    projectId: string;
    QuestionnarieId:string;
    QuestionId:string;
}
export class QuestionsUserViewModel{
    QuestionId:QuestionIdsViewModel=new QuestionIdsViewModel();
    Title:string;
    Users:UserBasicViewModel[]=[];
}
export class SendBackForwardQuestionsViewModel{
    InformationRequestId:string;
    Questions:QuestionsUserViewModel[]=[];
}
export class IndiviualEntityViewModel {
    selected: boolean;
    entityId: string;
    legalEntityName: string;
    taxableYearEnd: string;
}

export class ProjectDeliverableRightViewModel {
    isCentralUser: boolean;
    isExternalUser: boolean;
    deliverableRole: DeliverableRoleViewModel[];
    projectTemplate: ProjectTemplateViewModel[]; 
}

export class DeliverableRoleViewModel {
    entityId: string;
    canCreateBlock: boolean;
    canCreateStack: boolean;
    canUngroupStack: boolean;
    canPromoteDemote: boolean;
    canViewAttribute: boolean;
    canEditAttribute: boolean;
    canRemove: boolean;
    canCopyPaste: boolean;
    canAddToUserLibrary: boolean;
    canReArrange: boolean;
}

export class UserRightsViewModel {
    isCentralUser: boolean;
    isExternalUser: boolean;
    deliverableRole: DocViewDeliverableRoleViewModel[];
    projectTemplate: ProjectTemplateViewModel[];
    hasProjectTemplateAccess: boolean;
}

export class DocViewDeliverableRoleViewModel {
    entityId: string;
    roles: string[];
}

export const DocumentViewAccessRights =
{
    'CanSave': "CanSave",
    'CanGenerate': "CanGenerate",
    'CanCreateBlock': "CanCreateBlock",
    'CanCreateStack': "CanCreateStack",
    'CanUnstack': "CanUnstack",
    'CanRearrange': "CanRearrange",
    'CanViewAttribute': "CanViewAttribute",
    'CanEditAttribute': "CanEditAttribute",
    'CanEditContent': "CanEditContent",
    'CanCopyPaste': "CanCopyPaste",
    'CanDelete': "CanDelete",
    'CanLink': "CanLink",
    'CanStaff': "CanStaff",
    'CanSuggestForLibrary': "CanSuggestForLibrary",
    'CanAddtoUserLibrary': "CanAddtoUserLibrary",
    'CanAddtoOrganizationLibrary': "CanAddtoOrganizationLibrary",
    'CanPromoteDemote': "CanPromoteDemote",
    'CanCutCopyPaste': "CanCutCopyPaste",
    'CanFormatPainter': "CanFormatPainter",
    'CanChangeFont': "CanChangeFont",
    'CanEditParagraphSpacing': "CanEditParagraphSpacing",
    'CanAddHyperlink': "CanAddHyperlink",
    'CanFind': "CanFind",
    'CanView': "CanView",
    'CanFormat': "CanFormat",
    'CanNavigationPane': "CanNavigationPane",
    'CanCoverPage': "CanCoverPage",
    'CanPageBreak': "CanPageBreak",
    'CanSectionBreak': "CanSectionBreak",
    'CanTables': "CanTables",
    'CanPictures': "CanPictures",
    'CanHyperLinks': "CanHyperLinks",
    'CanShapes': "CanShapes",
    'CanCrossReference': "CanCrossReference",
    'CanHeadersAndFooters': "CanHeadersAndFooters",
    'CanPageNumber': "CanPageNumber",
    'CanFootNote': "CanFootNote",
    'CanTableofContent': "CanTableofContent",
    'CanAbbreviation': "CanAbbreviation",
    'CanTimeStamp': "CanTimeStamp",
    'CanSymbol': "CanSymbol",
    'CanMargins': "CanMargins",
    'CanSize': "CanSize",
    'CanOrientation': "CanOrientation",
    'CanColumns': "CanColumns",
    'CanRuler': "CanRuler",
    'CanPageBorder': "CanPageBorder",
    'CanColor': "CanColor",
    "CanPageSize":"CanPageSize",
    'CanWaterMark': "CanWaterMark",
    'CanStylePanel': "CanStylePanel",
    'canCreateQuestions' : "CanCreateQuestions",
    'CanStyleSection':'CanStyleSection',
    'CanParagraphSpacing':'CanParagraphSpacing',
}
export enum UserSearchOption{
    Email=1,
    LastName=0,
}