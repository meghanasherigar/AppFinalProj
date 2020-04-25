import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';
import { ViewCell, LocalDataSource } from '../../../../../../@core/components/ng2-smart-table';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { BlocksTagsResponseModel } from '../../../../../../@models/projectDesigner/template';
import { NbDialogRef } from '@nebular/theme';
import { DesignerService } from '../../../../services/designer.service';
import { TaskService } from '../../../document-view/services/task.service';
import { QuestionTagViewModel } from '../../../../../../@models/projectDesigner/task';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../../../../shared/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { DialogTypes } from '../../../../../../@models/common/dialog';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'ngx-blocks-edit-tag-inline',
  template: `<input type="text" [value]="row.answerTag" id="{{'text' + row.blockId}}" class="editableInput" (blur)="OnInputPage($event)">`,
  styleUrls: ['./blocks-edit-tag.component.scss']
})

export class BlockEditTagInLineComponent implements ViewCell, OnInit, OnDestroy {
  @Input() rowData: any;
  @Input() value: string;
  row: any;
  editedPageValue: any;

  subscriptions: Subscription = new Subscription();
  constructor(private _eventService: EventAggregatorService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.row = this.rowData;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockedit.isDuplicateTag).subscribe((payload: any) => {
      if (payload != null) {
        const elementId = `#text${payload.blockId}`;
        let editorEle = this.elementRef.nativeElement.querySelector(elementId);
        if (editorEle) {
          if (payload.isDuplicateTag) {
            editorEle.classList.add('editcolor');
          } else {
            editorEle.classList.remove('editcolor');
          }
        }
      }
    }));
  }
  OnInputPage(event) {
    let blockAnswerTag = new BlocksTagsResponseModel();
    blockAnswerTag.blockId = this.row.blockId;
    blockAnswerTag.blockTitle = this.row.blockTitle;
    blockAnswerTag.oldAnswerTag = this.row.oldAnswerTag;
    blockAnswerTag.answerTag = event.target.value;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockedit.suggestBlockEdit).publish(blockAnswerTag));
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

@Component({
  selector: 'ngx-blocks-edit-tag',
  templateUrl: './blocks-edit-tag.component.html',
  styleUrls: ['./blocks-edit-tag.component.scss']
})
export class BlocksEditTagComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  @Input() blocksTagsModel: any = [];
  @Input() projectId: any;
  source: LocalDataSource = new LocalDataSource();
  constructor(protected ref: NbDialogRef<any>,
    private taskService: TaskService,
    public designerService: DesignerService,
    private _eventService: EventAggregatorService,
    private DialogService: DialogService,
    private translate: TranslateService) { }

  settings = {
    hideSubHeader: true,
    actions: {
      add: false, edit: false, delete: false, select: true,
      position: 'right',
    },
    checkbox: false,
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      blockTitle: {
        title: 'Block Title',
        width: '20%',
      },
      answerTag: {
        title: 'AnswerTag',
        type: 'custom',
        renderComponent: BlockEditTagInLineComponent
      },
    },
    mode: 'inline'
  }
  ngOnInit() {
    let blocksTagsList: any[] = [];
    this.blocksTagsModel.forEach(element => {
      let existBlock = this.designerService.blocksTags.find(x => x.blockId == element.blockId);
      if (existBlock != undefined) {
        blocksTagsList.push(existBlock);
      } else {
        blocksTagsList.push(element);
      }
    });
    this.source.load(blocksTagsList);
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockedit.suggestBlockEdit).subscribe((payload: any) => {
      if (payload != null) {
        this.questionTagIsExistByProjectId(payload);
      }
    }));
  }
  questionTagIsExistByProjectId(data: BlocksTagsResponseModel) {
    let object = new QuestionTagViewModel();
    object.projectid = this.projectId;
    object.tag = data.answerTag;
    if (object.tag) {
      this.taskService.questionTagIsExistByProjectId(object).subscribe(response => {
        if (response)
          data.isDuplicateTag = true;
        else
          data.isDuplicateTag = false;

        this._eventService.getEvent(eventConstantsEnum.projectDesigner.blockedit.isDuplicateTag).publish(data)

        let existBlock = this.designerService.blocksTags.find(x => x.blockId == data.blockId);
        if (existBlock != undefined) {
          existBlock.answerTag = data.answerTag;
          existBlock.isDuplicateTag = data.isDuplicateTag;
        }
        else {
          this.designerService.blocksTags.push(data);
        }

      })

    }
  }
  save() {
    if(this.designerService.blocksTags.length == 0){
      this.designerService.blocksTags = this.blocksTagsModel;
    }
    this.designerService.blocksTags.forEach(element => {
      let data: BlocksTagsResponseModel = element;
      this.questionTagIsExistByProjectId(data);
    });

    let duplicateValue = this.designerService.blocksTags.find(x => x.isDuplicateTag);
    if (duplicateValue == undefined) {
      this.designerService.isBlocksTagsEdited = true;
      this.ref.close();
    } else {
      this.designerService.isBlocksTagsEdited = false;
    }
  }
  dismiss() {
    this.ref.close();
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
