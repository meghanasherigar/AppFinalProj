export class User {
  Id: number;
  FirstName: string;
  LastName: string;
  MiddleName: string = '';
  Email: string;
  Regions: Region[] = [];
  Entities: Entity[] = [];
  Countries: Country[] = [];
  Picture: string;
}

export class UserPreference {
  language: string;
  constructor() {
    this.language = 'en-US';
  }
}
export class UserSetting {
  isCountryAdmin: boolean;
  isGlobalAdmin: boolean;
  isPrivacyAccepted: boolean;
  isTermsAccepted: boolean;
  isWhatsNewHidden: boolean;
  adminView: boolean;
  isPorjectUser: boolean;
  whatsNewVisitCount: number;
  isExternalUser: boolean;
  isSuperAdmin: boolean;
  userPreferences: UserPreference = new UserPreference();
}

export class UserUISetting {
  isMenuExpanded: boolean;
  isLeftNavigationExpanded: boolean;
}

export class Region {
  Id: string;
  Name: string;
}

export class Entity {
  Id: number;
  Name: string;
}

export class Country {
  Id: string;
  Country: string;
  RegionId: string;
}
export class ReportTier {
  Id: string;
  ReportTier: string;
}
export class Employees {
  Name: string;
  Email: string;
}
export class TransactionType {
  id: string;
  transactionType: string;
}
export class Currency {
  id: string;
  currency: string;
}
export class InScope {
  checkbox1: boolean;
  checkbox2: boolean;
}
export class IndustryDomainModel {
  SubIndustryDetails: [];
  mainIndustryId: string;
  mainIndustryName: string;
}
export class LegalAutoSearch {
  projectId: string;
  legalEntityName: string;
}
export class EntitiesByCountry{
  CountryIds= new Array();
  ProjectId: string;
}
export class Entities {
  entityId: string;
  legalEntityName: string;
  counterpartyLegalEntityName: string;
  taxableYearEnd: Date;
  countryId: string;
  countryName:string;
  counterpartyCountryId:string;
  counterpartyCountryName:string;
}
export class TransactionTypeViewModel {
  id: string;
  transactionType: string;
}
export class NotificationRequestModel {
  pageSize: number;
  pageIndex: number;
}
export class CountryList {
  id: string;
  country: string;
  regionId: string;
}
export class LegalCountry{
  countryId: string;
  countryName:string;
}
export class TokenDetails{
  contextId: string;
  identityToken: string;
  expiryAt: string;
}
export enum DropDownSettings {
  idFieldLegalEntityId = 'entityId',
  textFieldLegalEntityName = 'legalEntityName',
  idFieldTransactionId = 'id',
  textFieldTransactionName = 'transactionType',
  idFieldCurrencyId = 'id',
  textFieldCurrency = 'currency',
  selectAllText = 'Select All',
  unSelectAllText = 'UnSelect All',
  classes = 'multiselect-dropdown'
}

