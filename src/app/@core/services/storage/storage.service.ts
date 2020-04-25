import { Injectable } from '@angular/core';

export enum StorageKeys {
  "USERSETTING" = 'UserSetting',
  "PROJECTINCONTEXT" = 'projectInContext',
  "THEMINGCONTEXT" = 'themingContext',
  "USERUISETTINGS" = "CurrentUserUISettings",
  "REDIRECTURLID" = "redirecturlid",
  "IDEALTIME"= "idealtime",
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
  ) { }

  getItem(key: string): string{
    return localStorage.getItem(key);
  }

  addItem(key: string, value: string){
    localStorage.setItem(key, value);
  }

  removeItem(key: string){
    localStorage.removeItem(key);
  }

  clearAll(){
    let keys = Object.keys(localStorage);
          keys.forEach((key) => { 
            localStorage.removeItem(key);
          });
  }

}
