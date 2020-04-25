import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(private roleService: RoleService, private router: Router) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const UserSetting = this.roleService.getUserRole();
    if (UserSetting && (UserSetting.isGlobalAdmin || UserSetting.isCountryAdmin) && UserSetting.adminView) {
      return true;
    }
    this.router.navigate(['pages/home']);
    return false;
  }
}
