import { ProjectRequest } from '../@models/project'
import { CurrentSettings } from './project-settings/project-settings';
import { BaseFilterViewModel } from './common/commonmodel';

export class OrganizationRequest {
    id: string;
    Organization: string;
    GUPData: GUP;
    MemberFirm: string;
    CreatedBy: string;
    LastModifiedBy: string;
    LastModifiedOn: Date;
    createdOn: Date;
    Industry: Industry[];
    CountryId: string;
    RegionId: string;
}

export class OrganizationResponse {
    id: string;
    Organization: string
    GUPData: GUP;
    MemberFirm: string;
    CreatedBy: string;
    LastModifiedBy: string;
    LastModifiedOn: Date;
    createdOn: Date;
    Industry: Industry[];
    Country: Country;
    Region: Region;
    AnyProjectsHidden: boolean;
    IsVisible: boolean;
}

export class OrganizationResultModel {
    TotalCount: number;
    Organizations: OrganizationResponse[]
}

export class Country {
    Id: string;
    Country: string;
    RegionId: string;
}

export class Region {
    RegionId: string;
    RegionName: string;
}

export class Industry {
    id: string;
    industry: string;
    subIndustries: SubIndustry[];
}

export class ProjectAccessRight {
    isCentralUser: boolean;
    isStaffedUsersDataAvailable: boolean;
    isEntityDataAvailable: boolean;
    isTransactionDataAvailable: boolean;
}

export class SubIndustry {
    id: string;
    subIndustry: string;
}

export class NewOrganizationRequest {
    Organization: OrganizationRequest;
    Project: ProjectRequest;
}


export class OrganizationDeleteModel {
    OrganizationIds: string[];
}

export class OrganizationFilterMenuDataModel {
    IsVisible: boolean;
    IsAdminViewEnabled: boolean;
}

export class OrganizationFilterDataModel {
    organizations: string[];
    gupNames: string[];
    country: string[];
    industry: Industry[];
}

export class ProjectContext {
    projectId: string;
    projectName: string;
    organizationId: string;
    organizationName: string;
    fiscalYear: string;
    industry: Industry[];
    ProjectAccessRight: ProjectAccessRight;
    projectExternalUserSettings: CurrentSettings[];
    projectCreator: string;
    informationRequestId: string;
    type: string
}

export class OrganizationFilterViewModel extends BaseFilterViewModel{
    OrganizationIds: [];
    GUPIds: GUPFilterDataModel[];
    IndustryIds: [];
    CountryIds: [];
    isVisible: boolean;
    IsAdminViewEnabled: boolean;
    IsFilterDataRequest: boolean;
}

export class GUPFilterDataModel {
    id: string;
    name: string;
}

export class OrganizationHideModel {
    OrganizationIds: string[];
    IsAdminViewEnabled: boolean;
}

export class OrganizationShowModel {
    OrganizationIds: string[];
    IsAdminViewEnabled: boolean;
}

export class GUP {
    gupId: string;
    gupName: string;
}

export class OrganizationSearchResponse {
    OrganizationId: string;
    OrganizationName: string;
}

export class HomeMenuIcons {
    IsCreateEnabled: boolean;
    IsEditEnabled: boolean;
    IsCopyEnabled: boolean;
    IsDeleteEnabled: boolean;
    IsHideEnabled: boolean;
    IsUnHideEnabled: boolean;
    IsViewHiddenEnabled: boolean;
    IsClearFilterEnabled: boolean;
    IsOrganizationFilterEnabled: boolean;
    IsProjectFilterEnabled: boolean;
}

export class NotificationGridResponseViewModel {
    notifications: NotificationGridData[];
    totalCount: number;
}

export class NotificationGridData {
    notoficationId: string;
    profileImage: string;
    massageTemplateId: string;
    massageContent: string[];
    displayMessage: string;
    actionRequestedOn: Date;
    actionRequested: string;
    readFlag: boolean;
}

export class NotifyUserDeleteViewModel {
    ProjectId: string;
    NotifyUserIds = [];
}

export class NotificationFilterRequestViewModel {
    ActionBy: string[] = [];
    DateFrom: Date = null;
    DateTo: Date = null;
    PageIndex: number;
    PageSize: number;
}

export class NotificationFilterMenuViewModel {
    actionBy: FilterViewModel[];
    dateFrom: Date;
    dateTo: Date;
}

export class FilterViewModel {
    id: string;
    name: string;
}