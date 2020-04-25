import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams } from '@angular/common/http';
import { Country, ReportTier, TransactionType, Currency, Entity,LegalAutoSearch, Entities, TransactionTypeViewModel, CountryList, EntitiesByCountry } from '../../@models/user';
import { AppliConfigService } from './appconfig.service';
import { EntityFilterViewModel } from '../../@models/entity';
import { PARAMETERS } from '@angular/core/src/util/decorators';

@Injectable({
  providedIn: 'root',
})
export class CountryService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
  public getAllCountries() {
    return this.http.get<Country[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getallcountrieslist');
  }
  public getAllCountriesList() {
    return this.http.get<CountryList[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getallcountrieslist');
  }
  public search_word(term){
    return this.http.get<Country[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getallcountries/?searchCountry=' + term);
}

public search_word_entity(legalEntityName){
 
  // const body = JSON.stringify(viewModel);
  // const headers = new HttpHeaders().set('Content-Type', 'application/json');
  // return this.http.get<legalAutoSearch[]>(this.appConfig.ApiBaseUrl() + '/api/common/getallentities/');
  //?projectId=DigiDox3.0&legalEntityName='+legalEntityName);
// var config = {
//   headers: {'Content-Type':"application/json"},
//   params: {'projectId':'DigiDox3.0','legalEntityName':'a'},
//   body:{	"ProjectId":"DigiDox3.0",
// 	"LegalEntityName":"a"	
//   }
// }
var viewModel = {ProjectId : 'DigiDox3.0', LegalEntityName : "a"};
  return this.http.get<LegalAutoSearch[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getallentities/?legalEntityName=a');
}
public getAllTiers()
{
  return this.http.get<ReportTier[]>(this.appConfig.ApiProjectSetupUrl()+ '/api/common/getallreporttiers');
}
public getAllTransactionTypes(term)
{
  return this.http.get<TransactionType[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/GetAllTransactionType/?transactionType=' + term);
}
public getAllCurrency()
{
  return this.http.get<Currency[]>(this.appConfig.ApiProjectSetupUrl()+ '/api/common/getallcurrencies');
}
public getAllEntities(projectID) {
  return this.http.get<Entities[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/Getallentitiesbyproject/'+projectID);
}
public getAllEntitiesByCountry(entitiesByCountry:EntitiesByCountry){
  return this.http.post<Entities[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/Getallentitiesbycountry/', entitiesByCountry);
}
public getalltransactiontypes() {
  return this.http.get<TransactionTypeViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getAllTransactionTypes');
}
public getalltransactiontypesmap() {
  return this.http.get<TransactionTypeViewModel[]>(this.appConfig.ApiProjectSetupUrl() + '/api/common/getalltransactiontypesmap');
}
}