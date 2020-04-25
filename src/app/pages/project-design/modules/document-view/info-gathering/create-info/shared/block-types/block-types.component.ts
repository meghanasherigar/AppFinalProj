import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { BlockType, QuestionsBlockTypeDetails } from '../../../../../../../../@models/projectDesigner/block';
import { eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { Subscription } from 'rxjs';
import { Index, createInfoLabels, InfoRequestStatus } from '../../../../../../../../@models/projectDesigner/infoGathering';
import { Introduction } from '../../../../../../../../@models/common/valueconstants';
import { DesignerService } from '../../../../../../services/designer.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'ngx-block-types',
  templateUrl: './block-types.component.html',
  styleUrls: ['./block-types.component.scss']
})
export class BlockTypesComponent implements OnInit, OnDestroy, OnChanges {
  selectedBlockType: any;
  currentIndex;
  currentTabIndex = 1;
  @Input()
  blockTypeDetails: QuestionsBlockTypeDetails[];
  percentage: any = 0;
  subscriptions: Subscription = new Subscription();
  blockTypeDetailsArray: QuestionsBlockTypeDetails[] = [];

  constructor(private _eventService: EventAggregatorService, private ngxLoader: NgxUiLoaderService, private designerService: DesignerService) { }

  ngOnInit() {
    this.currentIndex = 1;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadBlockTypes)
      .subscribe((payload: any) => {
        if (this.designerService.infoRequestStatus != InfoRequestStatus.Draft)
          this.blockTypeDetailsArray = JSON.parse(JSON.stringify(payload));

        if (this.designerService.infoRequestStatus == undefined || this.designerService.infoRequestStatus == InfoRequestStatus.Draft)
          return;
        if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress && !this.designerService.infoRequestinProgressEdited)
          return;
        this.calculatePercentage(payload);
      }));
  }
  ngOnChanges() {
    this.currentTabIndex = 1;
  }

  calculatePercentage(data) {
    this.percentage = 0;
    let numberOfQuestions = 0;
    let numberOfAnswers = 0;
    data.forEach((item: any) => {
      if (item.blockType.blockType != createInfoLabels.Introduction) {
        numberOfQuestions += item.numberOfQuestions;
        numberOfAnswers += item.numberOfAnswers;
      }
    });

    if (this.designerService.percentageCalculations.length > 0) {
      this.designerService.percentageCalculations.forEach((x: any) => {
        if (x.isIncreased)
          numberOfAnswers += 1;
        else
          numberOfAnswers -= 1;
      });
    }
    if (numberOfAnswers > 0 && numberOfQuestions > 0) {
      this.percentage = (numberOfAnswers * 100) / numberOfQuestions;
      this.percentage = this.percentage.toFixed(2);
    }

    //Block Type Tab Color Logic
    this.blockTypeDetails.forEach(item => {
      let noOfAnswers = 0;
      let savedAnswerNumber = this.blockTypeDetailsArray.find(x => x.blockType.blockType == item.blockType.blockType);
      if (savedAnswerNumber) {
        if (savedAnswerNumber.blockType.blockType != createInfoLabels.Introduction)
          noOfAnswers = savedAnswerNumber.numberOfAnswers;
      }
      let answerArray = this.designerService.percentageCalculations.filter(x => x.blockType == item.blockType.blockType);
      answerArray.forEach(value => {
        if (value.isIncreased)
          noOfAnswers += 1;
        else
          noOfAnswers -= 1;
      });
      item.numberOfAnswers = noOfAnswers;
    });


  }
  isPrevious() {
    if (this.currentIndex >= 2) {
      return true
    }
    return false;
  }
  isNext() {
    if (this.blockTypeDetails != null) {
      if (this.currentIndex <= this.blockTypeDetails.length - 1) {
        return true;
      }
      return false;
    }
  }
  goPrevious() {
    this.ngxLoader.startBackgroundLoader(this.ngxLoader['loaders'].createInfo.loaderId);
    this.currentTabIndex = this.currentTabIndex - 1;
    this.currentIndex = this.currentIndex - 1;
    this.loadQuestionAndAnswers(this.blockTypeDetails[this.currentIndex - 1].blockType, this.currentIndex - 1);
    this.ngxLoader.stopBackgroundLoader(this.ngxLoader['loaders'].createInfo.loaderId);

  }
  goNext() {
    this.ngxLoader.startBackgroundLoader(this.ngxLoader['loaders'].createInfo.loaderId);
    this.currentTabIndex = this.currentTabIndex + 1;
    this.currentIndex = this.currentIndex + 1;
    this.loadQuestionAndAnswers(this.blockTypeDetails[this.currentIndex - 1].blockType, this.currentIndex - 1);
    this.ngxLoader.stopBackgroundLoader(this.ngxLoader['loaders'].createInfo.loaderId);
  }

  loadQuestionAndAnswers(blockType: BlockType, i) {
    if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress || this.designerService.infoRequestStatus == InfoRequestStatus.Review) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.percentagecalculation).publish(true);
      this.designerService.infoRequestinProgressEdited = true;
      this.calculatePercentage(this.blockTypeDetailsArray);
    }
    else {
      this.designerService.infoRequestinProgressEdited = false;
    }
    this.currentIndex = i + 1;

    if (blockType.blockType == Introduction.value) {
      let IntroBlockType = new BlockType;
      IntroBlockType.blockType = Introduction.value;
      this.selectedBlockType = IntroBlockType;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(this.selectedBlockType);
    }
    else {
      this.selectedBlockType = blockType;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).publish(blockType);
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTabSelected(index) {
    this.currentTabIndex = index + 1;
  }
}
