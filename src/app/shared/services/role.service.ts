import { Injectable } from '@angular/core';
import { StorageKeys, StorageService } from '../../@core/services/storage/storage.service';
import { UserSetting } from '../../@models/user';


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private storageService: StorageService) { }

  setUserRole(userSetting: UserSetting) {
      this.storageService.addItem(StorageKeys.USERSETTING, JSON.stringify(userSetting));
  }

  getUserRole(): UserSetting {
    return  JSON.parse(this.storageService.getItem(StorageKeys.USERSETTING));
  }
}
