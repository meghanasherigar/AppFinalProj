import { Country, ReportTier } from "./user";
import { BaseFilterViewModel } from './common/commonmodel';
export class Entity {
  id: string;
  ProjectId: string
  legalEntityName: string;
  country: string;
  entityShortName: string;
  createdOn: Date;
  taxableYearEnd: Date;
  reportTier: any;
  localAddress: string;
  taxOffice: string;
  taxOfficeAddress: string;
  employeeName: string;
  employeeEmail: string;
  primaryContact: string;
  primaryContactEmail: string;
  taxId: string;
  overwrite: boolean;
  scope: string;
  delete: boolean;
  createdBy: string;
}
export class EntityFilterViewModel extends BaseFilterViewModel{
  projectID: string;
  entityName: any = [];
  entitYShortName: any = [];
  taxableYearStart: string;
  taxableYearEnd: string;
  taxID: any = [];
  country: string[];
  reportTier: any;
  createdDateStart: string;
  createdDateTo: string;
  createdBy: any = [];
  scope: any;
  EntityIds: string[];
}
export class EntityFilterDataModel {
  "ProjectID": string;
  entityName: [];
  entityShortName: [];
  taxID: [];
  "TaxableYearStart": Date;
  "TaxableYearEnd": Date;
  country: Country[];
  reportTier: any;
  createdBy: [];
  "CreatedDateStart": Date;
  "CreatedDateTo": Date;
  scope: boolean[];

}
export class EntityResponseViewModel {
  entityList: Entity[];
  entityFilterMenu: EntityFilterDataModel[];
  totalCount: number;
}
export class EntityContact {
  contact: string;
  isPrimary: boolean;
}