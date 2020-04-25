import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';

import { Transaction, TransactionFilterViewModel, TransactionResponseViewModel } from '../../../@models/transaction';
import { KsResponse, KfsResponse } from '../../../@models/ResponseStatus';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ShareDetailService } from '../../../shared/services/share-detail.service';
import { TransactionOutScopeModel } from '../../../@models/notification';
import { Entities } from '../../../@models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {
  transactionList: Transaction[];

  reloadTransaction = new BehaviorSubject<boolean>(false);
  refreshTransactionGrid = this.reloadTransaction.asObservable();
  
  constructor(private http: HttpClient, private appConfig: AppliConfigService,
    private shareDetailService: ShareDetailService) { }
  public getTransactions(transactionFilterViewModel: TransactionFilterViewModel) {
    
    return this
      .http
      .post<TransactionResponseViewModel>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/GetTransactions', transactionFilterViewModel)
  }

  public getFilterTransactionData(projectId) {
    return this
      .http
      .get(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/getalltransactions?projectId=' + projectId)
  }

  public createTransaction(viewModel: Transaction) {
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/InsertOne', viewModel);
  }
  public editTransaction(viewModel: Transaction) {
    
    const body = JSON.stringify(viewModel);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/UpdateOne', viewModel);
  }
  public deleteTransaction(transactionIds: string[]) {
    
    const body = JSON.stringify(transactionIds);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const project = this.shareDetailService.getORganizationDetail();
    var viewModel = { projectId: project.projectId, transactionIds: transactionIds };
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/DeleteTransaction', viewModel);
  }
  download_Transactions(viewModel:TransactionFilterViewModel) {
    return this.http.post<KfsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/transactions/downloadtransaction/",viewModel);
  }
  public deleteTransactionRequest(transactionIds: string[]) {
    const project = this.shareDetailService.getORganizationDetail();
    var viewModel = { projectId: project.projectId, transactionIds: transactionIds };
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/deletetransactionrequest', viewModel);
  }

  public TransactionOutOfScope(transactionOutScopeModel: TransactionOutScopeModel){
    return this.http.post<KsResponse>(this.appConfig.ApiProjectSetupUrl() + '/api/transactions/updateoutscope', transactionOutScopeModel);
  }
  refreshTransaction(refresh: boolean) {
    this.reloadTransaction.next(refresh);
  }
} 