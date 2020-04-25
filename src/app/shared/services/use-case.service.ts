import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppliConfigService } from './appconfig.service';
import { UseCase } from '../../@models/masterData/masterDataModels';

@Injectable({
  providedIn: 'root',
})
export class UseCaseService {

  constructor(private http: HttpClient, private appConfig: AppliConfigService) { }
  public getAllUseCases() {
    return this.http.get<UseCase[]>(this.appConfig.ApiProjectSetupUrl() + '/useCase');
  }
}
