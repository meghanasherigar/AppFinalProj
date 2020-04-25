import { Component, OnInit, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../services/designer.service';
import { blockSelectedModel } from '../../../../../../@models/projectDesigner/block';
import { NbDialogService } from '@nebular/theme';
import { AssignToComponent } from '../../../icon-view/content/region/templates/assign-to/assign-to.component';
import { UserRightsViewModel, DocViewDeliverableRoleViewModel, DocumentViewAccessRights } from '../../../../../../@models/userAdmin';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ngx-task-level2-menu',
  templateUrl: './task-level2-menu.component.html',
  styleUrls: ['./task-level2-menu.component.scss']
})
export class TaskLevel2MenuComponent implements OnInit {
  isBlockSelected = false;
  isEnableAssignTo = true;
  isEnableAssignAll = true;
  imageName: string = this.translate.instant("expand");
  show: boolean = true;
  subscriptions: Subscription = new Subscription();
  docViewRights: UserRightsViewModel;
  docViewRoles: DocViewDeliverableRoleViewModel[];
  blockSelectedModel = new blockSelectedModel();
  enableCreateQuestions: boolean = false;
  showQuestionList: boolean = this.designerService.showOrHideQuestionList;

  constructor(private readonly _eventService: EventAggregatorService, private el: ElementRef,
    private translate: TranslateService,
    private designerService: DesignerService,
    private dialogService: NbDialogService) { }

  ngOnInit() {
    this.designerService.showOrHideQuestionList = this.showQuestionList;
    this.blockSelectedModel.blockSelectCount = (this.designerService.blockList != undefined) ? this.designerService.blockList.length : 0;
    this.enableDisableIcons(this.blockSelectedModel);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).subscribe((payload: blockSelectedModel) => {
      this.enableDisableIcons(payload);
    }));
  }

  enableDisableIcons(payload: blockSelectedModel) {
    this.docViewRights = this.designerService.docViewAccessRights;
    this.designerService.canCreateQuestion = (this.docViewRights && this.docViewRights.isCentralUser) ? true : this.checkIsInRoles(DocumentViewAccessRights.canCreateQuestions);
    this.resetIcons();
    payload.isStack = (this.designerService.blockList != undefined && this.designerService.blockList.length == 1) ? this.designerService.blockList[0].isStack : false;

    //TODO: Roles will be implemented at the later point.
    if (this.designerService.canCreateQuestion) {
      if (payload.blockSelectCount == 1 && this.designerService.libraryDetails != undefined && this.designerService.libraryDetails.id != undefined && this.designerService.libraryDetails.id != 5 && this.designerService.libraryDetails.name != "Blocks") {
        this.isBlockSelected = false;
      }
      else if ((payload.blockSelectCount == 1 || (this.designerService.isExtendedIconicView == true && this.designerService.blockDetails != undefined && this.designerService.blockDetails != null)) && !payload.isStack) {
        this.isBlockSelected = true;
      }
    }
    if ((payload.blockSelectCount >= 1 || (this.designerService.isExtendedIconicView == true && this.designerService.blockDetails != undefined && this.designerService.blockDetails != null))) {
      this.isEnableAssignTo = true;
    }

  }

  resetIcons() {
    this.isBlockSelected = false;
    this.isEnableAssignTo = false;
  }

  toggleCreateQuestion(action: string) {
    if (this.designerService.editquestionClicked) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('closeEditQuestion');
      this.designerService.editquestionClicked = false;
      this.designerService.allowTagNameChange = false;
    }
    this.subscriptions.add(this._eventService
      .getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .publish(action));
  }

  blockStackReview(isReportReview) {
    this.designerService.isReportReview = isReportReview;
    this.dialogService.open(AssignToComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
    });
  }
  toggleQuestionList(event) {
    this.designerService.showOrHideQuestionList = event;
    this.showQuestionList = event;
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleCollapse() {
    this.show = !this.show;
    if (this.show) {
      this.imageName = this.translate.instant("collapse");

    }
    else {
      this.imageName = this.translate.instant("expand");
    }
  }

  checkIsInRoles(roleToCompare) {
    if (this.docViewRoles && this.docViewRoles.length > 0) {
      if (this.docViewRoles[0].roles.find(i => i == roleToCompare))
        return true;
      else
        return false;
    }
    else {
      if (this.designerService.isTemplateSection && this.docViewRights.hasProjectTemplateAccess)
        return true;
    }
  }
}
