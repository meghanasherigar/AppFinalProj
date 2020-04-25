import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  constructor() { }
  getItem(key: string): string {
    return sessionStorage.getItem(key);
  }
  addItem(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }
  removeItem(key: string) {
    sessionStorage.removeItem(key);
  }
  clearAll() {
    let keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }
}
