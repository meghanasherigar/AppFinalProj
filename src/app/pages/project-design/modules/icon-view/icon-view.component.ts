import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectDetails } from '../../../../@models/projectDesigner/region';
import { StorageService, StorageKeys } from '../../../../@core/services/storage/storage.service';
import { SessionStorageService } from '../../../../@core/services/storage/sessionStorage.service';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../shared/services/event/event.service';
import { EventConstants } from '../../../../@models/common/eventConstants';
import { Router } from '@angular/router';
import { ShareDetailService } from '../../../../shared/services/share-detail.service';
import { HomeService } from '../../../home/home.service';
import { ProjectUserService } from '../../../admin/services/project-user.service';
import { DesignerService } from '../../services/designer.service';
import { ProjectContext } from '../../../../@models/organization';
import { UserRightsViewModel } from '../../../../@models/userAdmin';

@Component({
  selector: 'ngx-icon-view',
  templateUrl: './icon-view.component.html',
  styleUrls: ['./icon-view.component.scss']
})
export class IconViewComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  projectDetails: ProjectContext;
  isRolesLoaded: boolean;
  
  constructor(private storageService: StorageService, 
    private sessionStorageService: SessionStorageService,
    private shareDetailService: ShareDetailService,
    private homeService: HomeService,
    private readonly eventService: EventAggregatorService, private router: Router,
    private projectUserService: ProjectUserService,
    private designerService: DesignerService) { }

  ngOnInit() {
    this.projectDetails = this.shareDetailService.getORganizationDetail();
    const addurl = '/#' + this.router.url;
    const currentUrl = addurl.substring(0, addurl.indexOf("("));
    this.projectUserService.getDomumentViewRights(this.projectDetails.projectId).subscribe((userRolesData: UserRightsViewModel) => {
      if (userRolesData) {
        this.designerService.docViewAccessRights = userRolesData;
        this.isRolesLoaded = true;
        this.eventService.getEvent(EventConstants.ActivateMenu).publish(currentUrl);
      }
    });
  }

  ngOnDestroy(): void {
    this.designerService.selectedThemeInContext = this.shareDetailService.getSelectedTheme();
    this.sessionStorageService.removeItem(StorageKeys.THEMINGCONTEXT);
    this.subscriptions.unsubscribe();
  }

}
