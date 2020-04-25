import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RoleService } from '../../../shared/services/role.service';
import { Router } from '@angular/router';
import { ShareDetailService } from '../../../shared/services/share-detail.service';


@Injectable({
  providedIn: 'root'
})
export class ProjectAuthGuardService implements CanActivate {

  constructor(private roleService: RoleService, private router: Router, private sharedDetailService:ShareDetailService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const UserSetting = this.roleService.getUserRole();
    const projectInContext = this.sharedDetailService.getORganizationDetail();
    if (projectInContext && projectInContext.projectId && (UserSetting && !UserSetting.adminView)) {
      return true;
    }
    this.router.navigate(['pages/home']);
    return false;
  }
}
