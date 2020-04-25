import {Country} from '../../@models/common/country'
import { BaseFilterViewModel } from '../common/commonmodel';


export class AdminUserViewModel {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    country: CountryViewModel;
    roles: RolesViewModel;
    auditTrial: AuditTrialViewModel;
}

class CountryViewModel {
    id: string;
    countryCode: string;
    countryName: string;
    regionId: string;
}

class RolesViewModel {
    isGlobalAdmin: boolean;
    isCountryAdmin: boolean;
}

class AuditTrialViewModel {
    createdById: string;
    createdByName: string;
    createdOn: Date;
    modifiedById: string;
    modifiedByName: string;
    modifiedOn: Date;
}

export class AdminFilterRequestViewModel  extends BaseFilterViewModel{
    UserIds: string[];
    IsGlobalAdmin: boolean;
    IsCountryAdmin: boolean;
    CountryIds: string[];
    CreatedByIds: string[];
    CreatedDateFrom: Date;
    CreatedDateTo: Date;
}

export class AdminUserEventPayload {
    Action : string;
    AdminUserFilterModel : AdminFilterRequestViewModel;
}

export class AdminUserResponseViewModel {
    userList: AdminUserViewModel[];
    totalUsersCount: number;
}

export class AdminUserGridData {
    Id: string;
    Name: string;
    Email: string;
    Role: string;
    Country: string;
    CreatedBy: string;
    CreatedOn: Date;
}

export class UserSearchResult {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    countryId: string;
    countryName: string;
}

export class AdminUserModel {
    Id: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Country: Country;
    Roles: UserRoleViewModel;
}

export class SearchViewModel {
    Keyword: string;
}

export class UserRoleViewModel {
    IsGlobalAdmin: boolean;
    IsCountryAdmin: boolean;
}

export class UserDeleteViewModel {
    UserIds = [];
}

export class UserDownloadViewModel {
    UserIds: string[];
    IsGlobalAdmin: boolean;
    IsCountryAdmin: boolean;
    CountryIds: string[];
    CreatedByIds: string[];
    CreatedDateFrom: Date;
    CreatedDateTo: Date;
}

export class AdminFilterDataModel {
    users: string[];
    roles: string[];
    country: string[];
    createdBy: string[];
    createdDateFrom: string;
    createdDateTo: string;
}

export class AdminMenuIcons {
    isCreateEnabled: boolean;
    isEditEnabled: boolean;
    isDeleteEnabled: boolean;
    isDownloadEnabled: boolean;
    isClearEnabled: boolean;
    isFilterEnabled: boolean;
}