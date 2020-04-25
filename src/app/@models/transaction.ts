import { BaseFilterViewModel } from './common/commonmodel';

export class Transaction {
  projectId: string;
  uniqueTransactionId: string;
  legalEntityName: string;
  counterpartyLegalEntityName: string;
  countryId:string;
  countryName:string;
  counterpartyCountryId:string;
  counterpartyCountryName:string;
  transactionType: string;
  transactionTypeResponse: string;
  counterPartyResponse: string;
  counterpartyTransactionType: string;
  projectTransactionTypeName: string;
  counterpartyProjectTransactionTypeName: string;
  transactionInScope: boolean;
  counterpartyTransactionInScope: boolean;
  overwrite: boolean;
  deleteTransaction: boolean;
  deleteCounterpartyTransaction: boolean;
  entityTransactionCurrency: string;
  entityTransactionAmount: string;
  counterpartyTransactionCurrency: string;
  counterpartyTransactionAmount: string;
  entityTransactionTaxableYearEnd: string;
  counterpartyTransactionTaxableYearEnd: string;
  createdOn: Date;
}

export class TransactionFilterViewModel  extends BaseFilterViewModel{
  projectID: string;
  legalEntityName: any = [];
  counterpartyLegalEntityName: any = [];
  countryId:string;
  countryName:string;
  counterPartyCountryId:string;
  counterPartyCountryName:string;
  transactionType: TransactionTypeDataModel[];
  counterpartyTransactionType: TransactionTypeDataModel[];
  transactionInScope: any = [];
  counterpartyTransactionInScope: any = [];
  entityTransactionAmount: any = [];
  counterpartyTransactionAmount: any = [];
  eTaxableYearStart: Date;
  eTaxableYearEnd: Date;
  cTaxableYearStart: Date;
  cTaxableYearEnd: Date;
  entityTransactionCurrency: string[];
  counterpartyTransactionCurrency: string[];
  TransactionIds: string[];
}


export class TransactionFilterDataModel {
  legalEntityName: [];
  counterpartyLegalEntityName: [];
  countryId:string;
  countryName:string;
  counterPartyCountryId:string;
  counterPartyCountryName:string;
  transactionType: TransactionTypeDataModel[];
  counterpartyTransactionType:TransactionTypeDataModel[];
  transactionInScope: [];
  counterpartyTransactionInScope: [];
  entityTransactionCurrency: [];
  counterpartyTransactionCurrency: [];
  entityTransactionAmount: [];
  counterpartyTransactionAmount: [];
  eTaxableYearStart: Date;
  eTaxableYearEnd: Date;
  cTaxableYearStart: Date;
  cTaxableYearEnd: Date;

}
export class TransactionResponseViewModel
{
  transactionList: Transaction[];
  transactionFilterMenu: TransactionFilterDataModel;
  totalCount: number;
}

export class TransactionTypeDataModel
{
id:string;
transactionType:string
} 
 
