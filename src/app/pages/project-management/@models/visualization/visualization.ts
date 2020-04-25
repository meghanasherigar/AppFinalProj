import { country } from "../deliverable/deliverable";
import { BaseFilterViewModel } from '../../../../@models/common/commonmodel';

export class visualizationRequest extends BaseFilterViewModel {
    projectId: string;
    countries?: string[];
    transactionTypes?:any[];
    entities?: string[];
}


export class VisualizationFilterResponse
{
    countries:[];
    transactions: [];
    entities:[];
}


export class VisualizationGridResponseModel {
    
    countryName: string;
    entityShortName:string;
    legalEntityName:string;
    transactions:Transaction[];
    taxableYearEnd:string;
    totalTransactionAmount:string;
    counterPartyCurrencyName:string;
}


export class Transaction
{
counterPartyResponse :string;
counterpartyLegalEntityName :string;
counterpartyTransactionAmount :string;
counterpartyProjectTransactionTypeName :string;
entityTransactionAmount:string;
entityTransactionTaxableYearEnd:string;
projectTransactionTypeName:string;
transactionTypeResponse:string;
counterpartyTransactionTaxableYearEnd:string;
}
