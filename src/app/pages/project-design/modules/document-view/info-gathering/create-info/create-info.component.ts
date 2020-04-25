import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { possibleSteps, createInfoLabels } from '../../../../../../@models/projectDesigner/infoGathering';
import { DesignerService } from '../../../../services/designer.service';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ResponseStatus } from '../../../../../../@models/ResponseStatus';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { ProjectContext } from '../../../../../../@models/organization';
import { selectedQuestionsViewModel } from '../../../../../../@models/projectDesigner/task';
import { NgxUiLoaderService, POSITION, SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-create-info',
  templateUrl: './create-info.component.html',
  styleUrls: ['./create-info.component.scss']
})
export class CreateInfoComponent implements OnInit {
  subscriptions: Subscription = new Subscription();
  coverpage: boolean = false;
  showPrevious: Boolean;
  showNext: Boolean;
  currentIndex = 1;
  selectedIndex: any;
  possibleRoutes = possibleSteps;
  IsReviewAssigneeDuplicate: boolean = true;
  projectDetails: ProjectContext;
  //ngx-ui-loader configuration
  loaderId = 'createInfo';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  @ViewChild('nextbutton') nextbutton;

  constructor(private taskService: TaskService, private router: Router, private _eventService: EventAggregatorService,
    private designerService: DesignerService, private ngxLoader: NgxUiLoaderService, private dialogService: DialogService, private translate: TranslateService) {

  }
  goNext() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.nextbutton.nativeElement.disabled = true;
    if (!this.validateAllPages()) {
      this.nextbutton.nativeElement.disabled = false;
      this.ngxLoader.stopBackgroundLoader(this.loaderId);
      return;
    }
    if (this.currentIndex == 1) {
      this.designerService.informationRequestModel.Questions = new Array<selectedQuestionsViewModel>();
      this.designerService.selectedQuestions.forEach(ele => {
        let data = new selectedQuestionsViewModel();
        data.questionId = ele.id;
        data.questionnaireId = ele.questionnariesId;
        data.title = ele.title;
        data.blockType = ele.blockType.blockType;
        data.blockTitle = ele.blockTitle;
        this.designerService.informationRequestModel.Questions.push(data);

      });
      if (this.designerService.infoDraftResponseModel.Id != null && this.designerService.infoDraftResponseModel.status == createInfoLabels.Draft)
        this.designerService.informationRequestModel.Id = this.designerService.infoDraftResponseModel.Id;
        //temporary fix from UI. But actually it should get fixed from API .
      if (this.designerService.informationRequestModel.DeliverableId == "" && this.designerService.informationRequestModel.Filters.DeliverableIds.length > 0)
        this.designerService.informationRequestModel.DeliverableId = this.designerService.informationRequestModel.Filters.DeliverableIds[0];
      this.subscriptions.add(this.taskService.validateinformationrequestquestions(this.designerService.informationRequestModel).subscribe(response => {
        if (response.status === ResponseStatus.Sucess) {
          this.currentIndex = this.currentIndex + 1;
          this.nextbutton.nativeElement.disabled = false;
          this.showPrevious = true;
          if (this.currentIndex == 4) {
            this.showNext = false;
          }
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).publish(this.currentIndex);
        } else {
          this.nextbutton.nativeElement.disabled = false;
          this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
          return false;
        }
      }));
    }
    else {
      this.currentIndex = this.currentIndex + 1;
      this.showPrevious = true;
      if (this.currentIndex == 4) {
        this.showNext = false;
      }
      this.nextbutton.nativeElement.disabled = false;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).publish(this.currentIndex);
    }
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }

  goPrevious() {
    this.ngxLoader.startBackgroundLoader(this.loaderId);
    this.currentIndex = this.currentIndex - 1;
    if (this.currentIndex < 4) {
      this.showNext = true;
    }
    if (this.currentIndex == 1) {
      this.showPrevious = false;
    }
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.currentCreateInfoStep).publish(this.currentIndex);
    this.ngxLoader.stopBackgroundLoader(this.loaderId);
  }
  validateAllPages() {
    let result = false;
    let tmpResult = false;

    if (this.currentIndex == 1) {
      if (this.designerService.selectedQuestions.length > 0) {
        return true;
      }
      else {
        this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_question_selection'));
        return false;
      }
    } else if (this.currentIndex == 2) {
      this.ReviewAssigneeDuplicateCheck();
      if (!this.IsReviewAssigneeDuplicate) {
        this.dialogService.Open(DialogTypes.Info, "Assignee and Co-reviewer(s) cannot be same.")
        return false;
      }
      if (this.designerService.isDeliverableSelected) {
        if (this.designerService.deliverableInformationRequestModel.length == 0
          || this.designerService.deliverableInformationRequestModel.length != this.designerService.selectedEntities.length) {
          this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_ir'));
          return false;
        }
        else {
          this.designerService.deliverableInformationRequestModel.forEach((x, index) => {
            if (!tmpResult) {
              this.designerService.informationRequestModel = x;
              result = this.validateIndividualInfoRequest();
              if (!result)
                tmpResult = true;
            }
            else
              return false;
          });
          if (!tmpResult)
            return true;
          else
            return false;
        }
      }
      else
        return this.validateIndividualInfoRequest();

    } else {
      return true;
    }

  }
  validateIndividualInfoRequest() {
    if (this.designerService.informationRequestModel.Name != '' &&
      this.designerService.informationRequestModel.AssignTo.length > 0 && this.designerService.informationRequestModel.Name != null &&
      this.designerService.informationRequestModel.DueDate != null) {
      return true;
    } else {
      this.dialogService.Open(DialogTypes.Info, this.translate.instant('screens.project-designer.document-view.info-gathering.create-info.validate_ir'));
      return false;
    }
  }
  ReviewAssigneeDuplicateCheck() {
    this.IsReviewAssigneeDuplicate = true;
    this.designerService.informationRequestModel.AssignTo.forEach(r => {
      if (this.designerService.informationRequestModel.CoReviewer.find(x => x.email == r.email) != null) {
        this.IsReviewAssigneeDuplicate = false;
      }
    })
  }

  ngOnInit() {
    this.showNext = true;
    this.showPrevious = false;
  }
  NavigateNext() {
    this.coverpage = true;
  }

}
