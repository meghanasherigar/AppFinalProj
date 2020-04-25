import { auditTrailModel } from '../../pages/project-management/@models/tasks/task';

export class AppUserViewModel {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    countryCode: string;
    organizationName: string;
    isExternalUser: boolean;
    hasAppAccess: boolean;
    auditTrail: auditTrailModel;
}

export class AppUserFilterRequestModel {
    PageIndex: number;
    PageSize: number;
    SearchOption: number;
    Keyword: string;
}

export class AppUserGridDataModel {
    Id: string;
    FirstName: string;
    LastName: string;
    Email: string;
    CountryCode: string;
    OrganizationName: string;
    IsExternalUser: string;
    HasAppAccess: string;
    CreatedBy: string;
    CreatedOn: string;
    UpdatedBy: string;
    UpdatedOn: string;
}

export class AppUserResponseViewModel {
    appUsers: AppUserViewModel[];
    appUsersCount: number;
}

export class AppUserAddRequestViewModel {
    FirstName: string;
    LastName: string;
    Email: string;
    CountryCode: string;
    OrganizationName: string;
    IsExternalUser: boolean;
    HasAppAccess: boolean;
}

export enum ActionOnAppUsers {
    add,
    load,
    addSuccessful,
    cancelAddUser,
    upload,
    downloadTemplate,
}

export enum AddAppUserFormControls {
  FirstName = 'FirstName',
  LastName = 'LastName',
  Email = 'Email',
  CountryCode = 'CountryCode',
  OrganizationName = 'OrganizationName',
  IsExternalUser = 'IsExternalUser',
  HasAppAccess = 'HasAppAccess',
}

export class AppUsersCountryMasterViewModel {
    CountryCode: string;
    CountryName: string;
}

export enum ActionOnAppUsersGrid {
    page = 'page',
    paging = 'paging',
}

export enum AppUserSearchOption {
    email = 0,
    firstName = 1,
    lastName = 2,
}

export enum SearchAppUserFormControls {
    SearchOptionType = 'SearchOptionType',
    SearchAppUserKeyword = 'SearchAppUserKeyword',

}