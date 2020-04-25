import { Component, OnInit } from '@angular/core';
import { TermsOfUseService } from '../../../shared/services/privacyandlegal/terms-of-use.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../user/user.service';
import { RoleService } from '../../../shared/services/role.service';
import { ProjectSettingService } from '../../project-setup/services/project-setting.service';
import * as moment from 'moment';
import { DesignerService } from '../../project-design/services/designer.service';
import { EventAggregatorService } from '../../../shared/services/event/event.service';
import { EventConstants } from '../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {
  public termsofUseContent: string = '';
  public lastRevised: string;
  constructor(private termsOfUseService: TermsOfUseService,
    private readonly eventService: EventAggregatorService,
    private translate: TranslateService,
    private router: Router,
    public authService: AuthService,
    private userservice: UserService,
    private roleService: RoleService,
    private designerService: DesignerService,
    ) { }

  ngOnInit() {
    this.designerService.disAbleIcon=false;
    this.getLastPublishedData('');
  }
  
  getLastPublishedData(userType: string){
    this.termsOfUseService.getLastPublishedData(userType).subscribe(response => {
      if (response) {
        this.termsofUseContent = response.termsOfUseContent != null ? response.termsOfUseContent :
        this.translate.instant('screens.project-setup.common.not_published');
        this.lastRevised=moment(response.publishedOn).local().format("DD MMM YYYY");
      }
    });
  }
  onAccept()
  {
    const usersetting =  this.roleService.getUserRole();
    usersetting.isTermsAccepted=true;
    this.roleService.setUserRole(usersetting);
    this.eventService.getEvent(EventConstants.DisAbleIcon).publish(true);
    this.userservice.acceptTermOfUse().subscribe();
   this.routeTo();
  }
  routeTo()
  {
    const userSetting = this.roleService.getUserRole();
    if (!userSetting.isWhatsNewHidden) {
      if (userSetting.whatsNewVisitCount <= 1) {
        this.router.navigate(['pages/./home/whatsnew']);
      } else {
        this.router.navigate(['pages/home']);
      }
    } else if (userSetting.isWhatsNewHidden) {
      this.router.navigate(['pages/./home/whatsnew']);
    }
  }
  onReject()
  {
    this.userservice.logOutUser();
  }

}
