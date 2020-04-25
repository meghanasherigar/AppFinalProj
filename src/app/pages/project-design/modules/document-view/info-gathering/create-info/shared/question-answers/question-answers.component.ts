import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { QuestionsResponseViewModel, QuestionAnswersDetailsViewModel, InformationRequestPreviewViewModel, DropDownTypeDomainModel, AnswerDetailsRequestModel, VersionDomainModel, AnswerDetailsDomainModel, AnswerVersionDomainModel, FileData, AttachmentViewModel, CommentsViewModel, CommentsViewModelArray, CommentDomainModelArray, CommentsDomainModel, AttachmentDomainModel, SubAnswerDetailsRequestViewModel, InfoGatheringIcons, CommentAuditTrailViewModel, AnswerAvailableViewModel, AnswerHistoryViewModel, CheckedViewModel, selectedQuestionsViewModel, QuestionTitleModel, CellValue, CellDataModel, PercentageCalculation, QuestionTagViewModel } from '../../../../../../../../@models/projectDesigner/task';
import * as ClassicEditor from '../../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, TableTypeCommands } from '../../../../../../../../@models/common/eventConstants';
import { DesignerService } from '../../../../../../services/designer.service';
import { TaskService } from '../../../../services/task.service';
import { Subscription } from 'rxjs';
import { QuestionType, createInfoLabels, Index, ApproveOrRejectDataModel, DeleteAttachmentDataModel, InformationResponseViewModel, InfoRequestStatus } from '../../../../../../../../../app/@models/projectDesigner/infoGathering';
import { DialogService } from '../../../../../../../../shared/services/dialog.service';
import { DialogTypes, Dialog } from '../../../../../../../../@models/common/dialog';
import { ResponseStatus } from '../../../../../../../../@models/ResponseStatus';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from '../../../../../../../../@core/components/ng2-smart-table';
import MultirootEditor from '../../../../../../../../../assets/@ckeditor/ckeditor5-build-classic';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { SendmailUserComponent } from '../../../../../../../common/sendmail-user/sendmail-user.component';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../../../../../../../shared/confirmation-dialog/confirmation-dialog.component';
import { CreateInfoService } from '../../../../services/create-info.service';
import { BlockType } from '../../../../../../../../@models/projectDesigner/block';
import { StorageService } from '../../../../../../../../@core/services/storage/storage.service';
import { QuestionIdsViewModel, UserRightsViewModel } from '../../../../../../../../@models/userAdmin';
import { ShareDetailService } from '../../../../../../../../shared/services/share-detail.service';
import { emptyCkeditor, ValueConstants } from '../../../../../../../../@models/common/valueconstants';
import { AddToAppendixComponent } from '../add-to-appendix/add-to-appendix.component';
import { POSITION, SPINNER, NgxUiLoaderService } from 'ngx-ui-loader';
import { template } from '@angular/core/src/render3';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'ngx-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.scss']
})
export class QuestionAnswersComponent implements OnInit, OnDestroy {
  informationRequestPreviewViewModel: InformationRequestPreviewViewModel = new InformationRequestPreviewViewModel();
  blockTypeId: string;
  blockType: string;
  contentEditableValue: boolean = false;
  @Input()
  questionList: QuestionAnswersDetailsViewModel[] = [];
  commentsUnSaved: CommentsViewModelArray[] = []
  questionCreationDates: string[] = [];
  messages: CommentDomainModelArray[] = [];
  hiddenQuestions: any;
  disalbledQuestions: any;
  unSaveCommentsIndex: number = 1;
  commentReplyId: string;
  isApproved = false;
  isReject = false;
  review: boolean = false;
  approveRejectStatus: boolean[] = [];
  lastSavedMessage: CommentDomainModelArray[] = [];
  isConditionQuestion: boolean;
  subQuestionFormGroupQuestionId;
  @ViewChild('uploader') uploader: any;
  private dialogTemplate: Dialog;
  public Editor = ClassicEditor;
  formData: FormGroup;
  answersArray: string[] = [];
  subscriptions: Subscription = new Subscription();
  multiSelectDropdownSettings: any;
  selectedItems: string[] = [];
  commentSections: any[] = [];
  commentsAvailable: boolean[] = [];
  selectedQuestion: any;
  selectedAnswerAvailableViewModel = new AnswerHistoryViewModel();
  selQuestionData: any = [];
  selectedQuestionIds = [];
  editableQuestionIds = [];
  editquestionClick: boolean = false;
  result: QuestionIdsViewModel[] = [];
  selectedQuestions: QuestionIdsViewModel[] = [];
  selectedQuestionTitle: QuestionTitleModel[] = [];
  userAccessRights: UserRightsViewModel;
  infoGatheringIcons: InfoGatheringIcons;
  templateDeliverableId: string;
  isTemplate: boolean;
  creatorNotApplicable: boolean = false;
  isAnswerChanged: boolean;
  profileForm: FormGroup
  settings: any
  fileUpload: any;
  selectedfile: any;
  //ngx-ui-loader configuration
  loaderId = 'UploadUserLoader';
  loaderPosition = POSITION.centerCenter;
  loaderFgsType = SPINNER.ballSpinClockwise;
  loaderColor = '#55eb06';
  editors: any[] = [];
  subEditors: any[] = [];

  settings0 = {
    hideSubHeader: true,
    hideHeader: true,
    actions: {
      columnTitle: '',
      edit: false,
      class: 'testclass',
      delete: false,
      custom: [
        {
          name: 'remove',
          title: '<img src="assets/images/information_Gathering/Remove_clicked.svg" class="smallIcon">'
        },
        {
          name: 'download',
          title: '<img src="assets/images/download-file-2.svg" class="smallIcon">'
        }
      ],
      position: 'right'
    },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      name: {
        title: '',
      }
    },
  }

  settings1 = {
    hideSubHeader: true,
    hideHeader: true,
    actions: {
      columnTitle: '',
      edit: false,
      class: 'testclass',
      delete: false,
      custom: [
        {
          name: 'remove',
          title: '<img src="assets/images/information_Gathering/Remove_clicked.svg" class="smallIcon">'
        },
        {
          name: 'download',
          title: '<img src="assets/images/download-file-2.svg" class="smallIcon">'
        },
        {
          name: 'appendix',
          title: '<img src="assets/images/attach-file-selected.svg" class="smallIcon">'
        },
      ],
      position: 'right'
    },
    pager: {
      display: true,
      perPage: 10,
    },
    columns: {
      name: {
        title: '',
      }
    },
  }
  isCommentEnable: boolean;
  files: LocalDataSource = new LocalDataSource();
  answeredCellValues: CellValue[] = [];
  fileIds: any[] = [];
  tableTypeData: any;
  tableEditorData: any;
  get questionTypeDetails(): FormArray { return this.formData.get('questionTypeDetails') as FormArray; }
  answerDetails: AnswerDetailsRequestModel[] = [];
  selectedEntityId: any;
  tableQuestionIds: CellValue[] = [];
  subtableQuestionIds: CellValue[] = [];
  editedTableData: any = [];
  questionType: any = QuestionType;
  hashTags: any = [];
  questionTagViewModel = new QuestionTagViewModel();

  constructor(
    private shareDetailService: ShareDetailService,
    private fb: FormBuilder, private dialog: MatDialog,
    private _eventService: EventAggregatorService,
    private designerService: DesignerService,
    private nbDialogService: NbDialogService,
    private dialogService: DialogService,
    private taskService: TaskService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private storageService: StorageService,
    private infoGatheringService: CreateInfoService,
    private ngxLoader: NgxUiLoaderService,
  ) { }

  ngOnInit() {
    const project = this.shareDetailService.getORganizationDetail();
    if (this.designerService.infoRequestStatus == InfoRequestStatus.Review) {
      this.review = true;
    }
    else
      this.review = false;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.sendChatMessage).subscribe((payload: any) => {
      this.sendMessage(payload.message, payload.position, payload.isExternal)
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.percentagecalculation).subscribe((payload: any) => {
      this.SaveAnswers(payload);
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.editChatMessage).subscribe((payload: any) => {
      let editedMessage = payload.message as CommentsDomainModel
      let position = payload.position;
      if (editedMessage.id == null) {
        this.designerService.savedComments[position].comments.find(x => x.index == editedMessage.index).message = editedMessage.message
        this.messages[position].comments.find(x => x.index == editedMessage.index).message == editedMessage.message;
      }
      else {
        this.editMessage(editedMessage, position)
      }
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.afterEditMessage).publish("edited")
    }))

    this.AccessRights();
    this.multiSelectDropdownSettings = {
      singleSelection: false,
      idField: 'userEmail',
      textField: 'userEmail',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      //itemsShowLimit: 1,
      allowSearchFilter: true,
      classes: 'multiselect-dropdown'
    };
    this.formData = this.fb.group({
      questionTypeDetails: this.fb.array([])
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.deleteChatMessage).subscribe((payload: any) => {
      let deletedMessage = payload.message as CommentsDomainModel
      let position = payload.position;
      if (deletedMessage.id == null) {
        let index = this.designerService.savedComments[position].comments.findIndex(x => x.index == deletedMessage.index);
        this.designerService.savedComments[position].comments.splice(index, 1);
        this.messages[position].comments.splice(index, 1);
      }
      else {
        this.deleteMessage(deletedMessage, position)
      }
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionsAfterPageNameUpdation).subscribe((payload) => {
      this.updateQuestionTypeDetails();
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).subscribe((payload) => {
      let blockType = payload as BlockType
      this.blockTypeId = blockType.blockTypeId;
      this.blockType = blockType.blockType;
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsLoaded).subscribe((payload) => {
      if (this.blockTypeId == undefined || this.blockTypeId == null) {
        this.blockTypeId = this.designerService.blockTypeInforReq;
      }
      this.questionList = payload as QuestionAnswersDetailsViewModel[];
      if (!this.designerService.isDeliverableSection)
        this.selectedEntityId = undefined;
      this.updateQuestionTypeDetails();
      //this.AccessRightsAddToAppendix();
    }))
    this.AccessRightsAddToAppendix();
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.questionsEntityLoaded).subscribe((payload) => {
      this.selectedEntityId = payload;
    }))
    this.formData.valueChanges.debounceTime(1000).subscribe((val) => {
      this.SaveAnswers(false);
    });

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe((payload) => {
      if (payload == 'closeEditQuestion') {
        this.editquestionClick = false;
        this.editableQuestionIds = [];
        this.designerService.editQuestionIds = [];
      }
    }));

    this.questionTagViewModel.projectid = project.projectId;
    if (this.designerService.isDeliverableSection) {
      this.questionTagViewModel.deliverableId = this.templateDeliverableId;
      this.questionTagViewModel.templateId = null;
    }
    else if (this.designerService.isTemplateSection) {
      this.questionTagViewModel.templateId = this.templateDeliverableId;
      this.questionTagViewModel.deliverableId = null;
    }

    this.taskService.getAllHashtags(this.questionTagViewModel).subscribe(data => {
      this.hashTags = data;
      this.designerService.hashTagList = data;
    });
  }
  sendMessage(message: any, index, isExternal: boolean) {
    let comment: CommentsViewModel = new CommentsViewModel();
    comment.message = message;
    comment.isExternal = isExternal;
    comment.isActive = true;
    comment.index = this.unSaveCommentsIndex;
    comment.isExternalUser = this.designerService.isExternalUser;
    if (this.commentReplyId != "" && this.commentReplyId != null) {
      comment.parentId = this.commentReplyId;
    }
    let commented: CommentsDomainModel = new CommentsDomainModel();
    commented.message = message;
    commented.index = this.unSaveCommentsIndex;
    commented.isExternal = isExternal;
    commented.isExternalUser = this.designerService.isExternalUser;
    let currentUser = JSON.parse(this.storageService.getItem('currentUser'));
    commented.auditTrail.createdBy.email = currentUser.profile.email;
    if (this.commentsUnSaved.length >= index + 1) {
      this.commentsUnSaved[index].comments.push(comment)
      this.messages[index].comments.push(commented);
    }
    else {
      for (let i = 0; i <= index; i++) {
        let emptycomment: CommentsViewModelArray = new CommentsViewModelArray();
        this.commentsUnSaved.push(emptycomment);
        let emptyCommented: CommentDomainModelArray = new CommentDomainModelArray();
        this.messages.push(emptyCommented);
      }
      this.commentsUnSaved[index].comments.push(comment)
      this.messages[index].comments.push(commented);
    }
    this.SaveAnswers(false);
    this.commentsUnSaved.splice(index, 1);
    this.unSaveCommentsIndex = this.unSaveCommentsIndex + 1;
  }

  deleteMessage(msg: CommentsDomainModel, position) {
    let comment: CommentsViewModel = new CommentsViewModel();
    comment.id = msg.id;
    comment.parentId = msg.parentId;
    comment.message = msg.message;
    comment.isExternal = false;
    comment.isActive = false;
    comment.index = this.unSaveCommentsIndex;
    if (this.commentsUnSaved.length >= position + 1) {
      this.commentsUnSaved[position].comments.push(comment)
      this.messages[position].comments.find(x => x.id == msg.id).isActive = false;
    }
    else {
      for (let i = 0; i <= position; i++) {
        let emptycomment: CommentsViewModelArray = new CommentsViewModelArray();
        this.commentsUnSaved.push(emptycomment);
        let emptyCommented: CommentDomainModelArray = new CommentDomainModelArray();
        this.messages.push(emptyCommented);
      }
      this.commentsUnSaved[position].comments.push(comment)
      if (this.messages[position].comments.find(x => x.id == msg.id) != null) {
        this.messages[position].comments.find(x => x.id == msg.id).isActive = false;
      }
    }
    this.SaveAnswers(false);
    this.commentsUnSaved.splice(position, 1);
    this.unSaveCommentsIndex = this.unSaveCommentsIndex + 1;
    this.messages.forEach((message, index) => {
      this.messages[index].comments = this.messages[index].comments.filter(x => x.isActive == true);
    })
  }

  editMessage(msg: CommentsDomainModel, position) {
    let comment: CommentsViewModel = new CommentsViewModel();
    comment.id = msg.id;
    comment.message = msg.message;
    comment.isExternal = false;
    comment.index = this.unSaveCommentsIndex;
    comment.isActive = true;
    if (this.commentsUnSaved.length >= position + 1) {
      this.commentsUnSaved[position].comments.push(comment)
      this.messages[position].comments.find(x => x.id == msg.id).message = msg.message;
    }
    else {
      for (let i = 0; i <= position; i++) {
        let emptycomment: CommentsViewModelArray = new CommentsViewModelArray();
        this.commentsUnSaved.push(emptycomment);
        let emptyCommented: CommentDomainModelArray = new CommentDomainModelArray();
        this.messages.push(emptyCommented);
      }
      this.commentsUnSaved[position].comments.push(comment)
      this.messages[position].comments.find(x => x.id == msg.id).message = msg.message;
    }
    this.SaveAnswers(false);
    this.commentsUnSaved.splice(position, 1);
    this.unSaveCommentsIndex = this.unSaveCommentsIndex + 1;
    this.messages.forEach((message, index) => {
      this.messages[index].comments = this.messages[index].comments.filter(x => x.isActive == true);
    })
  }
  toggleComment(i) {
    if (this.designerService.informationRequestModel.Id == null && this.designerService.viewedInforRequestId == null) {
      let commentSectionDetail: { "position": number, "isVisible": boolean } = { position: null, isVisible: null }
      commentSectionDetail.position = i;
      if (this.commentSections.length > 0 && this.commentSections.find(x => x.position == i) != null) {
        this.commentSections.find(x => x.position == i).isVisible = !this.commentSections.find(x => x.position == i).isVisible
      }
      else
        commentSectionDetail.isVisible = true;
      this.commentSections.push(commentSectionDetail);
    }
    else {
      this.infoGatheringService.getInformationRequestById(this.designerService.viewedInforRequestId).subscribe((data) => {
        let inforeq = data as InformationResponseViewModel;
        if (inforeq.status == "") {
          this.commentSections = [];
          let commentSectionDetail: { "position": number, "isVisible": boolean } = { position: null, isVisible: null }
          commentSectionDetail.position = i;
          commentSectionDetail.isVisible = true;
          this.commentSections.push(commentSectionDetail);
        }
        else {
          if (this.commentSections.length > 0 && this.commentSections.find(x => x.position == i) != null) {
            this.commentSections.find(x => x.position == i).isVisible = !this.commentSections.find(x => x.position == i).isVisible
          }
          else {
            this.commentSections = [];
            let commentSectionDetail: { "position": number, "isVisible": boolean } = { position: null, isVisible: null }
            commentSectionDetail.position = i;
            commentSectionDetail.isVisible = true;
            this.commentSections.push(commentSectionDetail);
          }
        }
      });
    }
  }

  internalComments(i: number) {
    if (!this.designerService.isExternalUser) {
      return this.messages[i].comments.filter(x => { return x.isExternal == false && x.isExternalUser == false })
    }
    else {
      return this.messages[i].comments.filter(x => { return x.isExternal == false && x.isExternalUser == true })
    }

  }

  externalComments(i: number) {
    if (!this.designerService.isExternalUser) {
      return this.messages[i].comments.filter(x => { return x.isExternal == true })
    }
    else {
      return this.messages[i].comments.filter(x => { return x.isExternal == true })
    }
  }
  checkCommentSection(i) {
    if (this.commentSections.length > 0 && this.commentSections.find(x => x.position == i) != null) {
      return this.commentSections.find(x => x.position == i).isVisible
    }
  }


  uploadFile(files, index) {
    var file = files[0].name.split('.');
    var ext = file.pop();
    ext = ext.toLowerCase();
    var fileName = file.pop();
    var fileinfo: FormData = new FormData();
    if (ext == createInfoLabels.FileExtPDF || ext == createInfoLabels.FileExtDocx || ext == createInfoLabels.FileExtDoc
      || ext == createInfoLabels.FileExtPPT || ext == createInfoLabels.FileExtXLS || ext == createInfoLabels.FileExtXLSX
      || ext == createInfoLabels.FileExtJPG || ext == createInfoLabels.FileExtPNG || ext == createInfoLabels.FileExtPPX) {
      if ((files[0].size / createInfoLabels.MBSize).toFixed(createInfoLabels.DecimalFix) < createInfoLabels.FileSizeLimit) {
        fileinfo.append(createInfoLabels.FileFormData, files[0]);
        let file = new FileData();
        let dateNow = new Date();
        file.id = createInfoLabels.DummyFileId + dateNow;
        file.name = fileName;
        file.fileFormData = fileinfo;
        file.fileExt = ext;
        let formGrp = this.getquestionFormGroup(index);
        let newFiles: FileData[] = [];
        let existingAttachment = (formGrp.controls[createInfoLabels.FileFormControl].value != null) ? formGrp.controls[createInfoLabels.FileFormControl].value : [];
        formGrp.controls[createInfoLabels.FileFormControl].setValue('');
        existingAttachment.forEach(attachment => {
          let exisitngfile = new FileData();
          exisitngfile.id = attachment.id;
          exisitngfile.name = attachment.name;
          exisitngfile.fileFormData = null;
          newFiles.push(exisitngfile);
        });
        newFiles.push(file);
        formGrp.controls[createInfoLabels.FileFormControl].setValue(newFiles);
      }
      else
        this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.invalidFileSize'));
    }
    else {
      this.dialogService.Open(DialogTypes.Error, this.translate.instant('screens.project-designer.document-view.info-gathering.errorMessages.invalidFileFormat'));
    }
    this.uploader.nativeElement.value = '';
  }
  onCustomAction(event) {
    if (event.action == createInfoLabels.Remove) {
      if (event.data.id.startsWith(createInfoLabels.DummyFileId)) {
        this.questionTypeDetails.controls.forEach((control, index) => {
          let newFileIndex: any = -1;
          let existingFiles = control[createInfoLabels.Controls][createInfoLabels.FileFormControl].value;
          newFileIndex = existingFiles.findIndex(x => x.id == event.data.id);
          if (newFileIndex > -1) {
            existingFiles.splice(newFileIndex, 1);
            let newFiles: FileData[] = [];
            existingFiles.forEach(attachment => {
              let file = new FileData();
              file.name = attachment.name;
              file.id = attachment.id;
              file.fileFormData = null;
              newFiles.push(file);
            });
            control[createInfoLabels.Controls][createInfoLabels.FileFormControl].setValue('');
            control[createInfoLabels.Controls][createInfoLabels.FileFormControl].setValue(newFiles);
          }
        });
      }
      else
        this.openDeleteConfirmDialog(event.data.id);
    }
    if (event.action == createInfoLabels.Download) {
      if (event.data.id.startsWith(createInfoLabels.DummyFileId)) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(event.data.fileFormData.get('file'));
        reader.onload = (_event) => {
          this.downloadFile(reader.result, event.data.fileFormData.get('file').name);
        }
      }
      this.downloadAttachment(event.data.uploadedName, event.data.name);
    }
    if (event.action == createInfoLabels.Appendix) {
      if (this.isTemplate == true)
        this.designerService.templateDeliverableIdAppendix = this.templateDeliverableId;
      else if (this.isTemplate == false) {
        this.designerService.templateDeliverableIdAppendix = this.templateDeliverableId;
      }
      this.designerService.UploadedFileName = event.data.uploadedName
      this.designerService.FileName = event.data.name;
      this.nbDialogService.open(AddToAppendixComponent, {
        closeOnBackdropClick: false,
        closeOnEsc: false,
      });
    }
  }

  downloadAttachment(fileUploadedName, fileName) {
    this.taskService.downloadAttachmentInfoRequest(fileUploadedName).subscribe((response: any) => {
      this.downloadFile(response, fileName);
    });
  }

  deleteFiles(fileId) {
    let deleteFileModel = new DeleteAttachmentDataModel();
    let questionDetail: any;
    let recordIndex: any;
    if (this.questionList[Index.zero].answerDetails.deliverables.length > 0) {
      questionDetail = this.questionList.find(x => x.answerDetails.deliverables[Index.zero].attachments.find(y => y.id == fileId) != undefined);
      recordIndex = this.questionList.findIndex(x => x.answerDetails.deliverables[Index.zero].attachments.find(y => y.id == fileId) != undefined);
      deleteFileModel.deliverableId = questionDetail.answerDetails.deliverables[Index.zero].templateOrDeliverableId;
    }
    else {
      questionDetail = this.questionList.find(x => x.answerDetails.templates[Index.zero].attachments.find(y => y.id == fileId) != undefined);
      recordIndex = this.questionList.findIndex(x => x.answerDetails.templates[Index.zero].attachments.find(y => y.id == fileId) != undefined);
      deleteFileModel.templateId = questionDetail.answerDetails.templates[Index.zero].templateOrDeliverableId;

    }
    deleteFileModel.questionId = questionDetail.questionId;
    deleteFileModel.questionnariesID = questionDetail.questionnariesId;
    deleteFileModel.id = fileId;
    this.taskService.deleteAttachmentInfoRequest(deleteFileModel).subscribe(response => {
      if (response.status == ResponseStatus.Sucess) {
        this.removeFileFromGrid(recordIndex, fileId);
        this.toastr.success(this.translate.instant('screens.home.labels.attachmentRemovedSuccessfully'));
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    }, error => {
      this.dialogService.Open(DialogTypes.Warning, error.message);
    });
  }
  private removeFileFromGrid(recordIndex: any, fileId: any) {
    let formgrp = this.getquestionFormGroup(recordIndex);
    let files = formgrp.controls[createInfoLabels.FileFormControl].value;
    let fileIndex = files.findIndex(x => x.id == fileId);
    if (fileIndex > -1)
      files.splice(fileIndex, 1);
    let newFiles: FileData[] = [];
    files.forEach(attachment => {
      let file = new FileData();
      file.name = attachment.name;
      file.id = attachment.id;
      file.fileFormData = null;
      newFiles.push(file);
    });
    formgrp.controls[createInfoLabels.FileFormControl].setValue('');
    formgrp.controls[createInfoLabels.FileFormControl].setValue(newFiles);
  }

  downloadFile(data, fileName) {
    try {
      const blob = new Blob([data], { type: createInfoLabels.FileTypeZip });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
      }
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, "Report could not be downloaded. Please try again!");
    }
  }
  openDeleteConfirmDialog(fileId): void {
    this.dialogTemplate = new Dialog();
    this.dialogTemplate.Type = DialogTypes.Delete;
    this.dialogTemplate.Message = this.translate.instant('screens.project-designer.appendix.messages.RecordDeleteConfirmationMessage');

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: this.dialogTemplate
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteFiles(fileId);
      }
    });
  }

  getquestionFormGroup(index): FormGroup {
    const formGroup = this.questionTypeDetails.controls[index] as FormGroup;
    return formGroup;
  }
  submitted() {
    // console.log(this.formData);
  }

  getIsHiddenQuestion(question) {
    let ele = this.hiddenQuestions.find(x => x.questionid == question);
    if (ele != null && ele.showOrHide == false) {
      return true;
    }
    else
      false;
  }
  getIsDisabledQuestion(question) {
    let ele = this.disalbledQuestions.find(x => x.questionid == question);
    if (ele != null && ele.showOrHide == true) {
      return true;
    }
    else
      false;
  }
  updateQuestionTypeDetails() {
    this.disalbledQuestions = [];
    this.hiddenQuestions = [];
    this.designerService.attachmentsFormData = [];
    this.formData.reset();
    this.emptyQuestionDetailsArray(this.questionTypeDetails);
    this.questionTypeDetails.reset();
    if (this.questionList.length > 0) {
      for (let j = 0; j < this.questionList.length; j++) {
        let commentsLst: CommentDomainModelArray = new CommentDomainModelArray();
        this.messages.push(commentsLst)
      }
      let i = 0;
      this.questionCreationDates = [];
      this.questionList.forEach(
        question => {
          //this.questionCreationDates.push(question.auditTrail.createdOn);
          if (this.designerService.InfoQuestionApproved.length > 0) {
            let approved = this.designerService.InfoQuestionApproved.find(x => x.questionId == question.questionId);
            if (approved != undefined)
              this.approveRejectStatus[i] = approved.isapproved;
          }
          let answersArray: string[] = [];
          let answerIdArray: string[] = [];
          if (this.designerService.ViewedIsTemplate) {
            if (question.answerDetails.templates.length > 0) {
              let AnswerDetails = question.answerDetails.templates.find(x => x.templateOrDeliverableId == this.designerService.ViewedTemplateOrDelieverable);
              if (AnswerDetails != undefined) {
                this.messages[i].comments = AnswerDetails.comments.filter(x => x.isActive == true);
                if (this.messages[i].comments.length > 0) {
                  this.commentsAvailable[i] = true;
                }
                else {
                  this.commentsAvailable[i] = false;
                }
              }

            }

          }
          else {
            if (question.answerDetails.deliverables.length > 0) {
              let AnswerDetails = question.answerDetails.deliverables.find(x => x.templateOrDeliverableId == this.designerService.ViewedTemplateOrDelieverable);
              if (AnswerDetails != undefined) {
                this.messages[i].comments = AnswerDetails.comments;
                if (this.messages[i].comments.length > 0) {
                  this.commentsAvailable[i] = true;
                }
                else {
                  this.commentsAvailable[i] = false;
                }
              }
            }
          }

          let attachments: any = [];
          if (question.answerDetails.deliverables == null || question.answerDetails.deliverables.length == 0) {
            question.answerDetails.templates.forEach(
              (templates) => {
                this.templateDeliverableId = templates.templateOrDeliverableId;
                this.isTemplate = true;
                if (templates.isNotApplicable && templates.versions.length > 0) {
                  templates.versions.forEach(v => answerIdArray.push(v.id));
                }
                else if (!templates.isNotApplicable && templates.versions.length > 0) {
                  templates.versions.forEach(v => answersArray.push(v.answer));
                  templates.versions.forEach(v => answerIdArray.push(v.id));
                }
              }
            )
            if (question.answerDetails.templates.length > 0) {
              attachments = question.answerDetails.templates[Index.zero].attachments;
            }
          }
          else {
            question.answerDetails.deliverables.forEach(
              (delieverable) => {
                this.templateDeliverableId = delieverable.templateOrDeliverableId;
                this.isTemplate = false;
                if (delieverable.isNotApplicable && delieverable.versions.length > 0) {
                  delieverable.versions.forEach(v => answerIdArray.push(v.id));
                }
                else if (!delieverable.isNotApplicable && delieverable.versions.length > 0) {
                  delieverable.versions.forEach(v => answersArray.push(v.answer));
                  delieverable.versions.forEach(v => answerIdArray.push(v.id));
                }
              }
            )
            attachments = question.answerDetails.deliverables[Index.zero].attachments;
          }
          i = i + 1;

          if (question.isPartOfOtherInfoReq && question.isShowOrHide) {
            let ele = { "questionid": "", "showOrHide": null };
            ele.questionid = question.questionId;
            ele.showOrHide = true;
            this.disalbledQuestions.push(ele)
          }
          else if (question.isPartOfOtherInfoReq && question.isShowOrHide == false) {
            let ele = { "questionid": "", "showOrHide": null };
            ele.questionid = question.questionId;
            ele.showOrHide = false;
            this.hiddenQuestions.push(ele)
          }
          switch (question.typeDetails.questionType.typeName) {
            case QuestionType.FreeText:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  files: [attachments],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  answer: answersArray[answersArray.length - 1] != null ? [answersArray[answersArray.length - 1]] : [],
                  answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.DateType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  files: [attachments],
                  answer: answersArray[answersArray.length - 1] != null ? [this.toDate(answersArray[answersArray.length - 1])] : [],
                  answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]


                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);

              }
              break;
            case QuestionType.NumberType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  files: [attachments],
                  answer: answersArray[answersArray.length - 1] != null ? [answersArray[answersArray.length - 1]] : [],
                  answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]

                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.DropDown:
              {
                if (question.typeDetails.modeOfSelection) {
                  let group = this.fb.group({
                    questionnairesId: [question.questionnariesId],
                    questionId: [question.questionId],
                    multiSelect: [question.typeDetails.modeOfSelection],
                    title: [question.title],
                    type: [question.typeDetails.questionType.typeName],
                    files: [attachments],
                    answer: answersArray[answersArray.length - 1] != null ? [answersArray[answersArray.length - 1].split("||")] : [],
                    answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                    options: [question.typeDetails.options],
                    fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                    isNotApplicable: [question.isNotApplicable],
                    allowToEdit: [question.allowToEdit],
                    forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                    blockTypeId: [question.blockType.blockTypeId],
                    blockType: [question.blockType.blockType],
                    comments: [question.comments],
                    allowAssigneeAttached: [question.allowAssigneeAttached],
                    tag: [question.tag],
                    entityId: [question.entityId]
                  });
                  let fa = this.formData.get('questionTypeDetails') as FormArray
                  fa.push(group);

                }
                else {
                  let group = this.fb.group({
                    questionnairesId: [question.questionnariesId],
                    questionId: [question.questionId],
                    title: [question.title],
                    multiSelect: [question.typeDetails.modeOfSelection],
                    type: [question.typeDetails.questionType.typeName],
                    files: [attachments],
                    answer: answersArray[answersArray.length - 1] != null ? [answersArray[answersArray.length - 1]] : [],
                    answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                    options: [question.typeDetails.options],
                    fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                    isNotApplicable: [question.isNotApplicable],
                    allowToEdit: [question.allowToEdit],
                    forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,

                    blockTypeId: [question.blockType.blockTypeId],
                    blockType: [question.blockType.blockType],
                    comments: [question.comments],
                    allowAssigneeAttached: [question.allowAssigneeAttached],
                    tag: [question.tag],
                    entityId: [question.entityId]


                  });
                  let fa = this.formData.get('questionTypeDetails') as FormArray
                  fa.push(group);
                }
              }
              break;
            case QuestionType.Logical:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  files: [attachments],
                  options: [question.typeDetails.options],
                  selectedOption: answersArray[answersArray.length - 1] != null ? [question.typeDetails.options.findIndex(x => x == answersArray[answersArray.length - 1])] : [],
                  mainAnswer: answersArray[answersArray.length - 1] != null ? [question.typeDetails.options.findIndex(x => x == answersArray[answersArray.length - 1])] : [],
                  answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                  subQuestions: this.fb.array([]),
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]


                });

                let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                this.emptyQuestionDetailsArray(subQuestionFormArray)
                question.typeDetails.subQuestions.forEach(subquestion => {
                  let subanswersArray: string[] = [];
                  let subAnswerIdArray: string[] = [];
                  let subquestionType = subquestion.typeDetails.questionType.typeName
                  if (this.designerService.ViewedIsTemplate) {
                    if (subquestion.answerDetails.templates.length > 0) {
                      // subquestion.answerDetails.template.versions.forEach(v => subanswersArray.push(v.answer))
                      subquestion.answerDetails.templates.forEach(
                        (templates) => {
                          if (templates.templateOrDeliverableId == this.designerService.ViewedTemplateOrDelieverable) {
                            templates.versions.forEach(v => subanswersArray.push(v.answer));
                            templates.versions.forEach(v => subAnswerIdArray.push(v.id));
                          }
                        }
                      )
                    }
                  }
                  else {
                    if (subquestion.answerDetails.deliverables.length > 0) {
                      subquestion.answerDetails.deliverables.forEach(
                        (delieverable) => {
                          if (delieverable.templateOrDeliverableId == this.designerService.ViewedTemplateOrDelieverable) {
                            delieverable.versions.forEach(v =>
                              subanswersArray.push(v.answer));
                            delieverable.versions.forEach(v => subAnswerIdArray.push(v.id));
                          }
                        }
                      )
                    }
                  }
                  if (subquestionType == QuestionType.TableType ||
                    subquestionType == QuestionType.BenchmarkRangeType ||
                    subquestionType == QuestionType.ComparabilityAnalysisType ||
                    subquestionType == QuestionType.CoveredTransactionType ||
                    subquestionType == QuestionType.ListType ||
                    subquestionType == QuestionType.PLQuestionType) {
                    if (subquestion.answerDetails.templates.length > 0 || subquestion.answerDetails.deliverables.length > 0) {
                      subanswersArray.push("AnswerAvailable");
                    }
                  }
                  switch (subquestion.typeDetails.questionType.typeName) {
                    case QuestionType.FreeText:
                      {
                        let subgroup = this.fb.group({
                          questionId: [subquestion.id],
                          title: [subquestion.title],
                          type: [subquestion.typeDetails.questionType.typeName],
                          files: [attachments],
                          answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1]] : [],
                          answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                          isConditionQuestion: [subquestion.isConditionalQuestion],
                          fwdMessages: [subquestion.fwdMessages],
                          option: [subquestion.option]
                        });
                        let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                        subQuestionFormArray.push(subgroup);
                      }
                      break;
                    case QuestionType.NumberType:
                      {
                        let subgroup = this.fb.group({
                          questionId: [subquestion.id],
                          title: [subquestion.title],
                          type: [subquestion.typeDetails.questionType.typeName],
                          files: [attachments],
                          answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1]] : [],
                          answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                          isConditionQuestion: [subquestion.isConditionalQuestion],
                          option: [subquestion.option]

                        });
                        let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                        subQuestionFormArray.push(subgroup);
                      }
                      break;
                    case QuestionType.DateType:
                      {
                        let subgroup = this.fb.group({
                          questionId: [subquestion.id],
                          title: [subquestion.title],
                          type: [subquestion.typeDetails.questionType.typeName],
                          files: [attachments],
                          option: [subquestion.option],
                          answer: subanswersArray[subanswersArray.length - 1] != null ? [this.toDate(subanswersArray[subanswersArray.length - 1])] : [],
                          answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                          isConditionQuestion: [subquestion.isConditionalQuestion]
                        });
                        let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                        subQuestionFormArray.push(subgroup);
                      }
                      break;
                    case QuestionType.DropDown:
                      {
                        if (subquestion.typeDetails.modeOfSelection) {
                          let subgroup = this.fb.group({
                            questionId: [subquestion.id],
                            title: [subquestion.title],
                            type: [subquestion.typeDetails.questionType.typeName],
                            multiSelect: [subquestion.typeDetails.modeOfSelection],
                            answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1].split("||")] : [],
                            answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                            files: [attachments],
                            options: [subquestion.typeDetails.options],
                            option: [subquestion.option],
                            fwdMessages: [subquestion.fwdMessages],
                            isConditionQuestion: [subquestion.isConditionalQuestion],

                          });
                          let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                          subQuestionFormArray.push(subgroup);
                        }
                        else {
                          let subgroup = this.fb.group({
                            questionId: [subquestion.id],
                            title: [subquestion.title],
                            type: [subquestion.typeDetails.questionType.typeName],
                            answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1]] : [],
                            answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                            multiSelect: [subquestion.typeDetails.modeOfSelection],
                            files: [attachments],
                            options: [subquestion.typeDetails.options],
                            option: [subquestion.option],
                            fwdMessages: [subquestion.fwdMessages],
                            isConditionQuestion: [subquestion.isConditionalQuestion]

                          });
                          let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                          subQuestionFormArray.push(subgroup);
                        }

                      }
                      break;
                    case QuestionType.YesNo:
                      {
                        let subgroup = this.fb.group({
                          questionId: [subquestion.id],
                          title: [subquestion.title],
                          type: [subquestion.typeDetails.questionType.typeName],
                          files: [attachments],
                          option: [subquestion.option],
                          answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1]] : [],
                          answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                          values: [question.typeDetails.values],
                          isConditionQuestion: [subquestion.isConditionalQuestion]
                        });
                        let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                        subQuestionFormArray.push(subgroup);
                      }

                    case QuestionType.TableType:
                    case QuestionType.BenchmarkRangeType:
                    case QuestionType.ComparabilityAnalysisType:
                    case QuestionType.CoveredTransactionType:
                    case QuestionType.ListType:
                    case QuestionType.PLQuestionType:
                      let subgroup = this.fb.group({
                        questionId: [subquestion.id],
                        title: [subquestion.title],
                        type: [subquestion.typeDetails.questionType.typeName],
                        files: [attachments],
                        option: [subquestion.option],
                        answer: subanswersArray[subanswersArray.length - 1] != null ? [subanswersArray[subanswersArray.length - 1]] : [],
                        answerId: subAnswerIdArray[subAnswerIdArray.length - 1] != null ? [subAnswerIdArray[subAnswerIdArray.length - 1]] : [],
                        values: [question.typeDetails.values],
                        isConditionQuestion: [subquestion.isConditionalQuestion]
                      });
                      let subQuestionFormArray = group.controls["subQuestions"] as FormArray;
                      subQuestionFormArray.push(subgroup);
                      break;
                    default:
                      break;
                  }
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.YesNo:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  files: [attachments],
                  answer: answersArray[answersArray.length - 1] != null ? [answersArray[answersArray.length - 1]] : [],
                  answerId: answerIdArray[answerIdArray.length - 1] != null ? [answerIdArray[answerIdArray.length - 1]] : [],
                  values: [question.typeDetails.values],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment,
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn,
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]


                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);

              }
              break;
            case QuestionType.TableType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.BenchmarkRangeType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.ComparabilityAnalysisType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.CoveredTransactionType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.ListType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            case QuestionType.PLQuestionType:
              {
                let group = this.fb.group({
                  questionnairesId: [question.questionnariesId],
                  questionId: [question.questionId],
                  title: [question.title],
                  type: [question.typeDetails.questionType.typeName],
                  oldanswers: [answersArray],
                  files: [attachments],
                  answer: [''],
                  answerId: [answerIdArray[answerIdArray.length - 1]],
                  text: [question.typeDetails.text],
                  fwdMessages: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].comment],
                  isNotApplicable: [question.isNotApplicable],
                  allowToEdit: [question.allowToEdit],
                  forwardedOn: question.forwardQuestionsComments.length == 0 ? [""] : [question.forwardQuestionsComments[question.forwardQuestionsComments.length - 1].forwardedOn],
                  blockTypeId: [question.blockType.blockTypeId],
                  blockType: [question.blockType.blockType],
                  comments: [question.comments],
                  allowAssigneeAttached: [question.allowAssigneeAttached],
                  tag: [question.tag],
                  entityId: [question.entityId]
                });
                let fa = this.formData.get('questionTypeDetails') as FormArray
                fa.push(group);
              }
              break;
            default:
              break;
          }

        }
      )
      this.changeDetectorRef.detectChanges();
      this.ngAfterViewInit();
    }
    this.lastSavedMessage = [];
    for (let k = 0; k < this.messages.length; k++) {
      if (this.lastSavedMessage.length >= k + 1) {
        this.lastSavedMessage[k].comments.push(this.messages[k].comments[this.messages[k].comments.length - 1]);
      }
      else {
        let emptyLastComment = new CommentDomainModelArray();
        this.lastSavedMessage.push(emptyLastComment);
        this.lastSavedMessage[k].comments.push(this.messages[k].comments[this.messages[k].comments.length - 1]);
      }
    }
    this.AccessRights();
  }
  emptyQuestionDetailsArray(questionedtails: FormArray) {
    while (questionedtails.length !== 0) {
      questionedtails.removeAt(0)
    }
  }
  toDate(dateStr: any) {
    return new Date(moment.utc(dateStr).local().format());
  }

  tableTypeQns: any = [];
  subTableTypeQns: any = []

  ngAfterViewInit() {
    this.questionList.forEach((x, index) => {
      let sourceElement: any = {};
      let editorDiv = document.querySelector('#freeTextAnswerEditor' + index);
      if (editorDiv != null) {
        if (this.getquestionFormGroup(index).controls['answer'].value != null) {
          editorDiv.innerHTML = this.getquestionFormGroup(index).controls['answer'].value;
        }
        var deliverableIdOrtemplateId: any;
        if (x.entityId != undefined)
          deliverableIdOrtemplateId = x.entityId
        else
          deliverableIdOrtemplateId = 'template';
        sourceElement["header" + '-' + x.questionId + '-' + deliverableIdOrtemplateId] = editorDiv;
        MultirootEditor.create1(sourceElement, undefined, this.hashTags, this.designerService.definedColorCodes, this.translate.currentLang)
          .then(newEditor => {
            this.editors.push(newEditor);
            document.querySelector('#freeTextAnswerToolbar-Menu' + index).appendChild(newEditor.ui.view.toolbar.element);
            newEditor.model.document.on('change:data', () => {
              this.SaveAnswers(false);
            });
          });
      }
    });
    if (this.questionList.length == this.questionList.filter(x => x.isPartOfOtherInfoReq == true).length) {
      this.designerService.allowToAssignee = false;
    }
    else {
      this.designerService.allowToAssignee = true;
    }
    this.questionList.forEach((x, index) => {
      let questionType = x.typeDetails.questionType.typeName;
      if (x.typeDetails.questionType.typeName == QuestionType.Logical) {
        x.typeDetails.options.forEach((y, optionIndex) => {
          if (x.typeDetails.subQuestions[optionIndex]) {
            if (x.typeDetails.subQuestions[optionIndex].isConditionalQuestion && x.typeDetails.subQuestions[optionIndex].typeDetails.questionType.typeName == QuestionType.FreeText) {
              let sourceElement: any = {};
              let editorDiv = document.querySelector('#freeTextSubAnswerEditor' + index + optionIndex);
              if (editorDiv != null) {
                if (this.getSubAnswer(index, optionIndex) != null) {
                  editorDiv.innerHTML = this.getSubAnswer(index, optionIndex);
                }
                var deliverableIdOrtemplateId: any;
                if (x.entityId != undefined)
                  deliverableIdOrtemplateId = x.entityId
                else
                  deliverableIdOrtemplateId = 'template';
                sourceElement["header" + '-' + x.typeDetails.subQuestions[optionIndex].id + '-' + deliverableIdOrtemplateId] = editorDiv;
                MultirootEditor.create1(sourceElement, undefined, this.hashTags, this.designerService.definedColorCodes, this.translate.currentLang)
                  .then(newEditor => {
                    this.subEditors.push(newEditor);
                    document.querySelector('#freeTextSubAnswerToolbar-Menu' + index + optionIndex).appendChild(newEditor.ui.view.toolbar.element);
                    newEditor.model.document.on('change:data', () => {
                      this.SaveAnswers(false);
                    });
                  });
              }
            }
            let subquestionType = x.typeDetails.subQuestions[optionIndex].typeDetails.questionType.typeName;
            if (x.typeDetails.subQuestions[optionIndex].isConditionalQuestion && (
              subquestionType == QuestionType.TableType ||
              subquestionType == QuestionType.BenchmarkRangeType ||
              subquestionType == QuestionType.ComparabilityAnalysisType ||
              subquestionType == QuestionType.CoveredTransactionType ||
              subquestionType == QuestionType.ListType ||
              subquestionType == QuestionType.PLQuestionType
            )) {
              let sourceElement: any = {};
              this.subtableQuestionIds = [];
              let editorName = 'tableTypeEditor' + x.questionId + index + optionIndex;
              let tableTypeEditor = document.querySelector('#' + editorName);
              if (tableTypeEditor != null) {
                tableTypeEditor.innerHTML = x.typeDetails.subQuestions[optionIndex].typeDetails.text;
                x.typeDetails.subQuestions[optionIndex].typeDetails.cellValues.forEach((cell, pos) => {
                  tableTypeEditor.getElementsByTagName('td')[pos].setAttribute('id', cell.id);
                  var divCell = document.createElement("div");
                  divCell.innerHTML = cell.value;
                  if (divCell.innerText !== "") {
                    cell.value = divCell.innerHTML;
                  }
                  else {
                    cell.value = divCell.innerText;
                  }
                  this.subtableQuestionIds.push(cell);
                });
                let tableTypeqn: any = {};
                tableTypeqn.questionId = x.questionId + index + optionIndex;
                tableTypeqn.tableQuestionIds = this.subtableQuestionIds;
                let subtableindex = this.subTableTypeQns.findIndex(y => y.questionId == x.questionId + index + optionIndex)
                if (subtableindex == -1) {
                  this.subTableTypeQns.push(tableTypeqn);
                }
                else {
                  this.subTableTypeQns.splice(subtableindex, 1);
                  this.subTableTypeQns.push(tableTypeqn)
                }



                if (this.getSubAnswer(index, optionIndex) != null) {
                  if (x.typeDetails.subQuestions[optionIndex].answerDetails.templates.length > 0) {
                    x.typeDetails.subQuestions[optionIndex].answerDetails.templates.forEach(el => {
                      for (let i = 0; i < this.subtableQuestionIds.length; i++) {
                        let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.subtableQuestionIds[i].key)[0];
                        if (modifiedCell) {
                          var divCell = document.createElement("div");
                          if (modifiedCell.isEditable == true) {
                            divCell.innerHTML = modifiedCell.value;
                            if (divCell.innerText !== "") {
                              this.subtableQuestionIds[i].value = divCell.innerHTML;
                            }
                            else {
                              this.subtableQuestionIds[i].value = divCell.innerText;
                            }
                            this.subtableQuestionIds[i].id = modifiedCell.id;
                            tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                            tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                          }
                          else if (modifiedCell.isEditable == false) {
                            divCell.innerHTML = this.subtableQuestionIds[i].value;
                            if (divCell.innerText !== "") {
                              this.subtableQuestionIds[i].value = divCell.innerHTML;
                            }
                            else {
                              this.subtableQuestionIds[i].value = divCell.innerText;
                            }
                            this.subtableQuestionIds[i].id = modifiedCell.id;
                            tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.subtableQuestionIds[i].id);
                            tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.subtableQuestionIds[i].value;
                          }
                        }
                      }
                    });
                  }
                  else if (x.typeDetails.subQuestions[optionIndex].answerDetails.deliverables.length > 0) {
                    x.typeDetails.subQuestions[optionIndex].answerDetails.deliverables.forEach(el => {
                      for (let i = 0; i < this.subtableQuestionIds.length; i++) {
                        let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.subtableQuestionIds[i].key)[0];
                        var divCell = document.createElement("div");
                        if (modifiedCell.isEditable == true) {
                          divCell.innerHTML = modifiedCell.value;
                          if (divCell.innerText !== "") {
                            this.subtableQuestionIds[i].value = divCell.innerHTML;
                          }
                          else {
                            this.subtableQuestionIds[i].value = divCell.innerText;
                          }
                          this.subtableQuestionIds[i].id = modifiedCell.id;
                          tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                          tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                        }
                        else if (modifiedCell.isEditable == false) {
                          divCell.innerHTML = this.subtableQuestionIds[i].value;
                          if (divCell.innerText !== "") {
                            this.subtableQuestionIds[i].value = divCell.innerHTML;
                          }
                          else {
                            this.subtableQuestionIds[i].value = divCell.innerText;
                          }
                          this.subtableQuestionIds[i].id = modifiedCell.id;
                          tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.subtableQuestionIds[i].id);
                          tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.subtableQuestionIds[i].value;
                        }
                      }
                    });
                  }

                }


                sourceElement["headerAnswer" + editorName] = tableTypeEditor;
                MultirootEditor.create1(sourceElement, undefined, this.hashTags, this.designerService.definedColorCodes, this.translate.currentLang)
                  .then(newEditor1 => {
                    document.querySelector('#tableTypeMenu' + x.questionId + index + optionIndex).appendChild(newEditor1.ui.view.toolbar.element);
                    this.tableEditorData = newEditor1;
                    // when 'Tab' Key pressed ,Restrict insert table row
                    this.disableCommand(this.tableEditorData.commands.get(TableTypeCommands.InsertTableRowBelow));
                    this.disableCommand(this.tableEditorData.commands.get(TableTypeCommands.InsertTableRowAbove));
                  });
              }

              var _parentThis = this;
              setTimeout(function () {
                x.typeDetails.subQuestions.forEach((option, subQuestionIndex) => {
                  option.typeDetails.cellValues.forEach((item, pos) => {
                    _parentThis.setsubTableIDsInsideEditor(pos, item, x, subQuestionIndex, index);
                  })
                })
              }, 1000);

            }
          }
        }
        )
      }
      else if (questionType == QuestionType.TableType ||
        questionType == QuestionType.BenchmarkRangeType ||
        questionType == QuestionType.ComparabilityAnalysisType ||
        questionType == QuestionType.CoveredTransactionType ||
        questionType == QuestionType.ListType ||
        questionType == QuestionType.PLQuestionType) {
        let sourceElement: any = {};
        this.tableQuestionIds = [];

        let editorName = 'tableTypeEditor' + x.questionId;
        let tableTypeEditor = document.querySelector('#' + editorName);
        if (tableTypeEditor != null) {
          tableTypeEditor.innerHTML = x.typeDetails.text;
          x.typeDetails.cellValues.forEach((cell, index) => {
            tableTypeEditor.getElementsByTagName('td')[index].setAttribute('id', cell.id);
            var divCell = document.createElement("div");
            divCell.innerHTML = cell.value;
            if (divCell.innerText !== "") {
              cell.value = divCell.innerHTML;
            }
            else {
              cell.value = divCell.innerText;
            }
            this.tableQuestionIds.push(cell);
          });

          let tableTypeqn: any = {};
          tableTypeqn.questionId = x.questionId;
          tableTypeqn.tableQuestionIds = this.tableQuestionIds;
          this.tableTypeQns.push(tableTypeqn);
          if (x.answerDetails.templates.length > 0) {
            x.answerDetails.templates.forEach(el => {
              for (let i = 0; i < this.tableQuestionIds.length; i++) {
                let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.tableQuestionIds[i].key)[0];
                if (modifiedCell) {
                  var divCell = document.createElement("div");
                  if (modifiedCell.isEditable == true) {
                    divCell.innerHTML = modifiedCell.value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                  }
                  else if (modifiedCell.isEditable == false) {
                    divCell.innerHTML = this.tableQuestionIds[i].value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.tableQuestionIds[i].id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.tableQuestionIds[i].value;
                  }
                }
              }
            });
          }
          else if (x.answerDetails.deliverables.length > 0) {
            x.answerDetails.deliverables.forEach(el => {
              for (let i = 0; i < this.tableQuestionIds.length; i++) {
                let modifiedCell = el.versions[0].cellValues.filter(j => j.key == this.tableQuestionIds[i].key)[0];
                if (modifiedCell) {
                  var divCell = document.createElement("div");
                  if (modifiedCell.isEditable == true) {
                    divCell.innerHTML = modifiedCell.value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', modifiedCell.id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = modifiedCell.value;
                  }
                  else if (modifiedCell.isEditable == false) {
                    divCell.innerHTML = this.tableQuestionIds[i].value;
                    if (divCell.innerText !== "") {
                      this.tableQuestionIds[i].value = divCell.innerHTML;
                    }
                    else {
                      this.tableQuestionIds[i].value = divCell.innerText;
                    }
                    this.tableQuestionIds[i].id = modifiedCell.id;
                    tableTypeEditor.getElementsByTagName('td')[i].setAttribute('id', this.tableQuestionIds[i].id);
                    tableTypeEditor.getElementsByTagName('td')[i].innerHTML = this.tableQuestionIds[i].value;
                  }
                }
              }
            });
          }
          sourceElement["headerAnswer" + editorName] = tableTypeEditor;
          MultirootEditor.create1(sourceElement, undefined, this.hashTags, this.designerService.definedColorCodes, this.translate.currentLang)
            .then(newEditor1 => {
              document.querySelector('#tableTypeMenu' + x.questionId).appendChild(newEditor1.ui.view.toolbar.element);
              this.tableEditorData = newEditor1;
              // when 'Tab' Key pressed ,Restrict insert table row
              this.disableCommand(this.tableEditorData.commands.get(TableTypeCommands.InsertTableRowBelow));
              this.disableCommand(this.tableEditorData.commands.get(TableTypeCommands.InsertTableRowAbove));
            });
        }
      }
      var _parentThis = this;
      if (questionType == QuestionType.TableType ||
        questionType == QuestionType.BenchmarkRangeType ||
        questionType == QuestionType.ComparabilityAnalysisType ||
        questionType == QuestionType.CoveredTransactionType ||
        questionType == QuestionType.ListType ||
        questionType == QuestionType.PLQuestionType) {
        setTimeout(function () {
          x.typeDetails.cellValues.forEach((item, index) => {
            _parentThis.setTableIDsInsideEditor(index, item, x);
          })
        }, 1000);
      }
    });
  }

  setsubTableIDsInsideEditor(index, item, x, optionIndex, questionindex) {
    let editorName = '#tableTypeEditor' + x.questionId + questionindex + optionIndex;
    let tableTypeEditor = document.querySelector(editorName);
    var editorDiv = tableTypeEditor.getElementsByTagName('table');
    if (editorDiv.length > 0) {
      if (editorDiv[0].getElementsByTagName('td')[index]) {
        editorDiv[0].getElementsByTagName('td')[index].id = item.id;
        if (item.isEditable == false) {
          editorDiv[0].getElementsByTagName('td')[index].style.pointerEvents = "none";
        }
        let ballonPanelClass = document.getElementsByClassName('ck-balloon-panel');
        for (let index = 0; index < ballonPanelClass.length; index++) {
          ballonPanelClass.item(index).setAttribute("style", "display:none");
        }
      }

    }
  }

  setTableIDsInsideEditor(index, item, x) {
    let editorName = '#tableTypeEditor' + x.questionId;
    let tableTypeEditor = document.querySelector(editorName);
    var editorDiv = tableTypeEditor.getElementsByTagName('table');
    if (editorDiv.length > 0) {
      editorDiv[0].getElementsByTagName('td')[index].id = item.id;
      if (item.isEditable == false) {
        editorDiv[0].getElementsByTagName('td')[index].style.pointerEvents = "none";
      }
      let ballonPanelClass = document.getElementsByClassName('ck-balloon-panel');
      for (let index = 0; index < ballonPanelClass.length; index++) {
        ballonPanelClass.item(index).setAttribute("style", "display:none");
      }
    }
  }
  DisableTableDelete(event, id) {
    // this.contentEditableValue=false;
    var target = event.target || event.srcElement || event.currentTarget;
    if (target.attributes.id != undefined) {
      var idAttr = target.attributes.id;
      var value = idAttr.nodeValue;
    }
    else
      var value = event.target.parentElement.parentElement.id
    if (value.match('tableTypeEditor'))
      document.getElementById(value).setAttribute('contenteditable', 'false');
    // $('.contentEditableValue').attr('contenteditable', 'false');
  }
  tableEditorChange(event) {
    let editorActiveTag = document.activeElement as HTMLElement;
    this.editedTableData = [];
    if (editorActiveTag.tagName != "TD" && editorActiveTag.tagName != "TH") {
      event.preventDefault();
    }
    else {
      var _parentThis = this;
      setTimeout(function () {
        let cellData = new CellDataModel();
        cellData.id = document.activeElement.id;
        cellData.innerHtml = document.activeElement.innerHTML;
        cellData.innerText = document.activeElement.textContent;
        _parentThis.editedTableData.push(cellData);
        _parentThis.SaveAnswers(false);
      });
    }
  }

  getSubAnswer(questionIndex, subQuestionIndex): string {
    let subQuestionsArray = this.getsubQuestionFormGroup(questionIndex) as FormArray;
    let subQuestionFormGroup = subQuestionsArray.controls[subQuestionIndex] as FormGroup;
    return subQuestionFormGroup.controls["answer"].value;
  }
  valueCheck(event) {
    if (event.keyCode == 69 || event.keyCode == 81) {
      return false
    }
  }
  logicTypeChange(event, ParentGroupIndex) {
    var position = event.target.value.split(":")[0];
    const questionTypeDetailsFormArray = this.formData.get('questionTypeDetails') as FormArray;
    const subQuestionFormArray = questionTypeDetailsFormArray.controls[ParentGroupIndex] as FormArray;
    const subquestionformArray = subQuestionFormArray.controls['subQuestions'] as FormArray;
    let mainquestionoptions = subQuestionFormArray.controls['options'].value as string[];
    const mainanswer = mainquestionoptions[subQuestionFormArray.controls['mainAnswer'].value];
    if (subquestionformArray.controls[position]) {
      var subQueryFormGroup = subquestionformArray.controls[position] as FormGroup;
      if (subQueryFormGroup.controls["isConditionQuestion"].value) {
        this.isConditionQuestion = true;
        this.subQuestionFormGroupQuestionId = subQueryFormGroup.controls["questionId"].value;
        if (mainanswer != subQueryFormGroup.controls['option'].value) {
          subQueryFormGroup.controls["answer"].setValue("");
          document.querySelector("#freeTextSubAnswerEditor" + ParentGroupIndex + position).innerHTML = "";
        }
      }
    }
    else {
      this.isConditionQuestion = false;
    }
  }
  showConditionalQuestion(index) {
    const questionTypeDetailsFormArray = this.formData.get('questionTypeDetails') as FormArray;
    const subQuestionFormArray = questionTypeDetailsFormArray.controls[index] as FormArray;
    if (subQuestionFormArray.controls["selectedOption"] != null) {
      const position = subQuestionFormArray.controls["selectedOption"].value;
      const subquestionformArray = subQuestionFormArray.controls['subQuestions'] as FormArray;
      let mainquestionoptions = subQuestionFormArray.controls['options'].value as string[];
      const mainanswer = mainquestionoptions[subQuestionFormArray.controls['mainAnswer'].value];
      if (subquestionformArray.controls[position]) {
        var subQueryFormGroup = subquestionformArray.controls[position] as FormGroup;
        if (subQueryFormGroup.controls["isConditionQuestion"].value) {
          this.subQuestionFormGroupQuestionId = subQueryFormGroup.controls["questionId"].value;
          this.isConditionQuestion = true;
          return true;
        }
      }
    }
    else {
      this.isConditionQuestion = false;
      return false;
    }
  }

  approveReject(action, questionData, index) {
    if (action == createInfoLabels.Approve) {
      this.isApproved = true;
      this.isReject = false;
    }
    else {
      this.isReject = true;
      this.isApproved = false;
    }
    let approveRejectModel = new ApproveOrRejectDataModel();
    let questionDetail = this.questionList.find(x => x.questionId == questionData.controls['questionId'].value);
    if (action == createInfoLabels.Approve)
      approveRejectModel.isapproved = true;
    else
      approveRejectModel.isapproved = false;

    approveRejectModel.questionnairesId = questionDetail.questionnariesId;
    approveRejectModel.questionId = questionDetail.questionId;
    approveRejectModel.informationRequestId = this.designerService.infoRequestId;

    if (this.designerService.ViewedIsTemplate)
      approveRejectModel.templateId = this.designerService.ViewedTemplateOrDelieverable;
    else
      approveRejectModel.deliverableId = this.designerService.ViewedTemplateOrDelieverable;

    this.taskService.approveReject(approveRejectModel).subscribe((response: any) => {
      if (response.status == ResponseStatus.Sucess) {
        if (action == createInfoLabels.Approve) {
          this.approveRejectStatus[index] = true;
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.answerApprovedSuccessfully'));

        }
        else {
          this.approveRejectStatus[index] = false;
          this.toastr.success(this.translate.instant('screens.project-designer.document-view.info-gathering.answerSendSuccessfully'));

        }
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    }, error => {
      this.dialogService.Open(DialogTypes.Warning, error.message);
    });
  }

  getsubQuestionFormGroup(index) {
    const questionTypeDetailsFormArray = this.formData.get('questionTypeDetails') as FormArray;
    const subQuestionFormArray = questionTypeDetailsFormArray.controls[index] as FormArray;
    const subquestionsformArray = subQuestionFormArray.controls['subQuestions'] as FormArray;
    return subquestionsformArray;
  }

  SaveAnswers(isNextorPrevious: boolean) {
    let dropDownAnswer: string;
    this.answerDetails = [];
    let answerDetailsArray = this.formData.controls['questionTypeDetails'] as FormArray;
    for (let i = 0; i < answerDetailsArray.length; i++) {
      this.isAnswerChanged = true;
      let formGroup = this.getquestionFormGroup(i);
      if (formGroup.controls["questionId"].value != null) {
        let answerDetails: AnswerDetailsRequestModel = new AnswerDetailsRequestModel();
        answerDetails.attachments = [];
        var isAttachment = false;
        answerDetails.questionId = formGroup.controls['questionId'].value;
        answerDetails.questionnairesId = formGroup.controls['questionnairesId'].value;
        answerDetails.answerId = formGroup.controls['answerId'].value;
        let questionDetail = this.questionList.find(x => x.questionId == formGroup.controls["questionId"].value);
        if (questionDetail != undefined) {
          let answersArray = [];
          if (questionDetail.answerDetails.deliverables == null || questionDetail.answerDetails.deliverables.length == 0) {
            questionDetail.answerDetails.templates.forEach(
              (templates) => {
                this.templateDeliverableId = templates.templateOrDeliverableId;
                this.isTemplate = true;
                if (templates.attachments != undefined && templates.attachments.length > 0)
                  isAttachment = true;
                if (templates.versions.length > 0) {
                  templates.versions.forEach(v => answersArray.push(v.answer));
                }
              }
            )
          }
          else {
            questionDetail.answerDetails.deliverables.forEach(
              (delieverable) => {
                this.templateDeliverableId = delieverable.templateOrDeliverableId;
                this.isTemplate = false;
                if (delieverable.attachments != undefined && delieverable.attachments.length > 0)
                  isAttachment = true;
                if (delieverable.versions.length > 0) {
                  delieverable.versions.forEach(v => answersArray.push(v.answer));
                }
              }
            )
          }
          let lastAnswer = answersArray[answersArray.length - 1];
          var deliverableIdOrtemplateId: any;
          if (this.designerService.infoDraftResponseModel.TemplateId != undefined && this.designerService.infoDraftResponseModel.TemplateId != '' && this.designerService.infoDraftResponseModel.TemplateId != ValueConstants.DefaultId)
            deliverableIdOrtemplateId = 'template';
          else if (this.designerService.infoDraftResponseModel.DeliverableId != undefined && this.designerService.infoDraftResponseModel.DeliverableId != '' && this.designerService.infoDraftResponseModel.DeliverableId != ValueConstants.DefaultId)
            deliverableIdOrtemplateId = this.designerService.infoDraftResponseModel.DeliverableId;
          else if (this.designerService.informationRequestModel.TemplateId != undefined && this.designerService.informationRequestModel.TemplateId != '' && this.designerService.informationRequestModel.TemplateId != ValueConstants.DefaultId)
            deliverableIdOrtemplateId = 'template';
          else if (this.designerService.informationRequestModel.DeliverableId != undefined && this.designerService.informationRequestModel.DeliverableId != '' && this.designerService.informationRequestModel.DeliverableId != ValueConstants.DefaultId)
            deliverableIdOrtemplateId = this.designerService.informationRequestModel.DeliverableId;
          if (formGroup.controls['type'].value == QuestionType.FreeText) {
            let editorDiv = document.querySelector("#freeTextAnswerEditor" + i);
            if (editorDiv != null) {
              let finalAnswer: string;
              // let innerhtml = document.querySelector("#freeTextAnswerEditor" + i).innerHTML;
              this.editors.forEach(editor => {
                let rootNames = editor.model.document.getRootNames();
                for (let rootName of rootNames) {
                  if (rootName == "header" + '-' + answerDetails.questionId + '-' + deliverableIdOrtemplateId) {
                    finalAnswer = editor.getData({ rootName });
                    break;
                  }
                }
              });

              if (isNextorPrevious) {
                let blockType = formGroup.controls['blockType'].value;
                let questionId = formGroup.controls['questionId'].value;
                let isNotApplicable = formGroup.controls['isNotApplicable'].value;
                if (isNotApplicable == true)
                  finalAnswer = lastAnswer;
                this.percentageCalulation(lastAnswer, finalAnswer, "", questionId, blockType, isAttachment);
              }
              if (lastAnswer == finalAnswer) {
                answerDetails.answer = finalAnswer;
                // this.isAnswerChanged = false; Should check impacts with Anil
              }
              else {
                if (emptyCkeditor.value == finalAnswer) {
                  answerDetails.answer = '';
                }
                else {
                  answerDetails.answer = finalAnswer;
                  // answerDetails.answer = document.querySelector("#freeTextAnswerEditor" + i).innerHTML;
                }
              }


            }

          }
          else
            if (formGroup.controls['type'].value == QuestionType.Logical) {
              let currentQuestion = this.questionList.find(x => x.questionId == formGroup.controls['questionId'].value);
              let options = formGroup.controls["options"].value as string[];
              let selectedOption = formGroup.controls['selectedOption'].value;
              if (formGroup.controls['selectedOption'].value != null) {
                let subquestion = currentQuestion.typeDetails.subQuestions.find(sub => sub.option == options[selectedOption])
                if (subquestion != undefined) {
                  let subanswersArray: string[] = [];
                  if (subquestion.answerDetails.deliverables.length == 0 || subquestion.answerDetails.deliverables == undefined || subquestion.answerDetails.deliverables == null) {
                    subquestion.answerDetails.templates.forEach(
                      (templates) => {
                        templates.versions.forEach(v => subanswersArray.push(v.answer));
                      }
                    )
                  }
                  else {
                    subquestion.answerDetails.deliverables.forEach(
                      (delieverable) => {
                        delieverable.versions.forEach(v => subanswersArray.push(v.answer));
                      }
                    )
                  }
                  var lastSubAnswer = subanswersArray[subanswersArray.length - 1];
                }
              }
              else {
                lastSubAnswer = null;
              }

              if (selectedOption != null && selectedOption.toString() !== "") {
                answerDetails.answer = options[selectedOption];
                let subquestionFormArray = formGroup.controls["subQuestions"] as FormArray;
                if (subquestionFormArray.controls[selectedOption]) {
                  let subQuestionFormGroup = subquestionFormArray.controls[selectedOption] as FormGroup;
                  let subAnswerDetailRequestViewModel = new SubAnswerDetailsRequestViewModel();
                  subAnswerDetailRequestViewModel.subQuestionId = subQuestionFormGroup.controls["questionId"].value;
                  let subQuestionType = subQuestionFormGroup.controls["type"].value;
                  if (subQuestionFormGroup.controls["type"].value == QuestionType.FreeText) {
                    let editorDiv = document.querySelector("#freeTextSubAnswerEditor" + i + selectedOption);
                    if (editorDiv != null) {
                      let finalSubAnswer: string;
                      this.subEditors.forEach(subEditor => {
                        let rootNames = subEditor.model.document.getRootNames();
                        for (let rootName of rootNames) {
                          if (rootName == "header" + '-' + subAnswerDetailRequestViewModel.subQuestionId) {
                            finalSubAnswer = subEditor.getData({ rootName });
                            break;
                          }
                        }
                        if (subQuestionFormGroup.controls["isNotApplicable"] != undefined) {
                          let isNotApplicable = subQuestionFormGroup.controls["isNotApplicable"].value;
                          if (isNotApplicable == true)
                            finalSubAnswer = lastSubAnswer;
                        }
                      });
                      //let innerhtml = document.querySelector("#freeTextSubAnswerEditor" + i + selectedOption).innerHTML;
                      if (emptyCkeditor.value == finalSubAnswer) {
                        answerDetails.answer = null;
                      }
                      else {
                        subAnswerDetailRequestViewModel.subAnswer = finalSubAnswer;
                        //subAnswerDetailRequestViewModel.subAnswer = document.querySelector("#freeTextSubAnswerEditor" + i + selectedOption).innerHTML;
                      }
                    }
                  }
                  else if (subQuestionType == QuestionType.TableType ||
                    subQuestionType == QuestionType.ComparabilityAnalysisType ||
                    subQuestionType == QuestionType.CoveredTransactionType ||
                    subQuestionType == QuestionType.ListType ||
                    subQuestionType == QuestionType.PLQuestionType ||
                    subQuestionType == QuestionType.BenchmarkRangeType) {
                    let editorName = 'tableTypeEditor' + formGroup.controls['questionId'].value + i + selectedOption;
                    let tableTypeEditor = document.querySelector('#' + editorName);
                    if (this.editedTableData.length > 0) {
                      let subquestionId = "";
                      this.subTableTypeQns.forEach(table => {
                        let _selectedTableQuestion = table.tableQuestionIds.filter(qn => qn.id == this.editedTableData[0].id);
                        if (_selectedTableQuestion.length > 0) subquestionId = table.questionId;
                      })
                      if (subquestionId != "" && subquestionId == answerDetails.questionId + i + selectedOption) {
                        let selectedTableQuestion = this.subTableTypeQns.filter(id => id.questionId == subquestionId);

                        if (selectedTableQuestion.length > 0) {
                          for (let i = 0; i < this.editedTableData.length; i++) {
                            selectedTableQuestion[0].tableQuestionIds.forEach((item) => {
                              if (item.id == this.editedTableData[i].id && item.value !== this.editedTableData[i].innerText) {
                                item.value = this.editedTableData[i].innerHtml;
                              }
                            });
                          }
                          subAnswerDetailRequestViewModel.cellValue = selectedTableQuestion[0].tableQuestionIds;
                          subAnswerDetailRequestViewModel.type = subQuestionFormGroup.controls['type'].value;
                          this.subTableTypeQns.forEach(table => { if (table.questionId == subquestionId) table.tableQuestionIds = selectedTableQuestion[0].tableQuestionIds });
                        }
                      }
                      else {
                        let answers: any = [];
                        answers = this.subTableTypeQns.filter(item => item.questionId == answerDetails.questionId + i + selectedOption);
                        if (answers.length > 0) {
                          answerDetails.subAnswer.push(answers[0].tableQuestionIds);
                        }
                      }
                    }
                  }
                  else if (subQuestionFormGroup.controls["type"].value == QuestionType.DropDown) {
                    if (subQuestionFormGroup.controls["multiSelect"].value) {
                      let optionsselected = subQuestionFormGroup.controls["answer"].value as string[];
                      if (optionsselected != null && optionsselected !== []) {
                        subAnswerDetailRequestViewModel.subAnswer = optionsselected.join("||");
                      }
                    }
                    else {
                      subAnswerDetailRequestViewModel.subAnswer = subQuestionFormGroup.controls["answer"].value;
                    }
                  }
                  else {
                    subAnswerDetailRequestViewModel.subAnswer = subQuestionFormGroup.controls["answer"].value;
                  }
                  subAnswerDetailRequestViewModel.subAnswerId = subQuestionFormGroup.controls["answerId"].value;
                  answerDetails.subAnswer = [];
                  answerDetails.subAnswer.push(subAnswerDetailRequestViewModel);
                  if (subQuestionType != QuestionType.TableType &&
                    subQuestionType != QuestionType.ComparabilityAnalysisType &&
                    subQuestionType != QuestionType.CoveredTransactionType &&
                    subQuestionType != QuestionType.ListType &&
                    subQuestionType != QuestionType.PLQuestionType &&
                    subQuestionType != QuestionType.BenchmarkRangeType) {
                    if (answerDetails.answer && lastAnswer == answerDetails.answer && lastSubAnswer == subAnswerDetailRequestViewModel.subAnswer) {
                      // this.isAnswerChanged = false; Should check with Anil for impact

                      // answerDetails.answer = null;
                      // answerDetails.subAnswer = [];
                    }
                    if (isNextorPrevious) {
                      let type = "";
                      if (subQuestionFormGroup.controls["type"].value == QuestionType.FreeText) {
                        if (subAnswerDetailRequestViewModel.subAnswer == undefined) {
                          subAnswerDetailRequestViewModel.subAnswer = emptyCkeditor.value;
                        }
                        type = emptyCkeditor.value;
                      }
                      let questionId = subQuestionFormGroup.controls['questionId'].value;
                      let blockType = formGroup.controls['blockType'].value;
                      this.percentageCalulation(lastSubAnswer, subAnswerDetailRequestViewModel.subAnswer, "", questionId, blockType, false);
                    }
                  }

                }
                else {
                  if (lastAnswer == answerDetails.answer) {
                    // this.isAnswerChanged = false;
                    // answerDetails.answer = null;
                  }
                }
              }

            }
            else if (formGroup.controls["type"].value == QuestionType.DropDown) {
              if (formGroup.controls["multiSelect"].value) {
                let options = "";
                let optionsselected = formGroup.controls["answer"].value as string[];
                if (optionsselected != null) {
                  options = optionsselected.join("||");
                }
                if (isNextorPrevious) {
                  let blockType = formGroup.controls['blockType'].value;
                  let questionId = formGroup.controls['questionId'].value;
                  let isNotApplicable = formGroup.controls['isNotApplicable'].value;
                  if (isNotApplicable == true)
                    options = lastAnswer;
                  this.percentageCalulation(lastAnswer, options, "", questionId, blockType, false);
                }
                if (lastAnswer == options) {
                  answerDetails.answer = options;
                  // this.isAnswerChanged = false;
                  // answerDetails.answer = null;
                }
                else {
                  if (optionsselected != null && optionsselected != []) {
                    answerDetails.answer = options;
                  }
                  else {
                    answerDetails.answer = "";
                  }
                }

              }
              else {
                if (isNextorPrevious) {
                  let blockType = formGroup.controls['blockType'].value;
                  let questionId = formGroup.controls['questionId'].value;
                  let answer = formGroup.controls['answer'].value;
                  this.percentageCalulation(lastAnswer, answer, undefined, questionId, blockType, false);
                }
                if (lastAnswer == formGroup.controls['answer'].value) {
                  // this.isAnswerChanged = false;
                  // answerDetails.answer = null;
                  answerDetails.answerId = formGroup.controls['answerId'].value;
                  answerDetails.answer = formGroup.controls["answer"].value;
                }
                else {
                  answerDetails.answerId = formGroup.controls['answerId'].value;
                  answerDetails.answer = formGroup.controls["answer"].value;
                }
              }
            }
            else if (formGroup.controls['type'].value == QuestionType.TableType ||
              formGroup.controls['type'].value == QuestionType.ComparabilityAnalysisType ||
              formGroup.controls['type'].value == QuestionType.CoveredTransactionType ||
              formGroup.controls['type'].value == QuestionType.ListType ||
              formGroup.controls['type'].value == QuestionType.PLQuestionType ||
              formGroup.controls['type'].value == QuestionType.BenchmarkRangeType) {
              if (this.editedTableData.length > 0) {
                let questionId = "";
                this.tableTypeQns.forEach(table => {
                  let _selectedTableQuestion = table.tableQuestionIds.filter(qn => qn.id == this.editedTableData[0].id);
                  if (_selectedTableQuestion.length > 0) questionId = table.questionId;
                })

                if (questionId != "" && questionId == answerDetails.questionId) {
                  let selectedTableQuestion = this.tableTypeQns.filter(id => id.questionId == questionId);

                  if (selectedTableQuestion.length > 0) {
                    for (let i = 0; i < this.editedTableData.length; i++) {
                      selectedTableQuestion[0].tableQuestionIds.forEach((item) => {
                        if (item.id == this.editedTableData[i].id && item.value !== this.editedTableData[i].innerText) {
                          item.value = this.editedTableData[i].innerHtml;
                        }
                      });
                    }
                    this.answeredCellValues = selectedTableQuestion[0].tableQuestionIds;
                    answerDetails.cellValue = this.answeredCellValues;
                    this.tableTypeQns.forEach(table => { if (table.questionId == questionId) table.tableQuestionIds = this.answeredCellValues });
                  }
                }
                else {
                  let answers: any = [];
                  answers = this.tableTypeQns.filter(item => item.questionId == answerDetails.questionId);
                  if (answers.length > 0) {
                    this.answeredCellValues = answers[0].tableQuestionIds;
                    answerDetails.cellValue = this.answeredCellValues;
                  }
                }
              }
              else {
                let answers: any = [];
                answers = this.tableTypeQns.filter(item => item.questionId == answerDetails.questionId);
                if (answers.length > 0) {
                  this.answeredCellValues = answers[0].tableQuestionIds;
                  answerDetails.cellValue = this.answeredCellValues;
                }
              }
            }
            else {
              if (isNextorPrevious) {
                let blockType = formGroup.controls['blockType'].value;
                let questionId = formGroup.controls['questionId'].value;
                let answer = formGroup.controls['answer'].value;
                let isNotApplicable = formGroup.controls['isNotApplicable'].value;
                if (isNotApplicable == true)
                  answer = lastAnswer;
                this.percentageCalulation(lastAnswer, answer, undefined, questionId, blockType, false);
              }
              if (lastAnswer == formGroup.controls['answer'].value) {
                answerDetails.answer = formGroup.controls["answer"].value;
                answerDetails.answerId = formGroup.controls["answerId"].value;
                // this.isAnswerChanged = false;
                // answerDetails.answer = null
              }
              else {
                answerDetails.answer = formGroup.controls["answer"].value;
                answerDetails.answerId = formGroup.controls["answerId"].value;
              }
            }
          if (this.designerService.infoDraftResponseModel.TemplateId != undefined && this.designerService.infoDraftResponseModel.TemplateId != '' && this.designerService.infoDraftResponseModel.TemplateId != ValueConstants.DefaultId)
            answerDetails.templateId = this.designerService.infoDraftResponseModel.TemplateId;
          else if (this.designerService.infoDraftResponseModel.DeliverableId != undefined && this.designerService.infoDraftResponseModel.DeliverableId != '' && this.designerService.infoDraftResponseModel.DeliverableId != ValueConstants.DefaultId)
            answerDetails.deliverableId = this.designerService.infoDraftResponseModel.DeliverableId;
          else if (this.designerService.informationRequestModel.TemplateId != undefined && this.designerService.informationRequestModel.TemplateId != '' && this.designerService.informationRequestModel.TemplateId != ValueConstants.DefaultId)
            answerDetails.templateId = this.designerService.informationRequestModel.TemplateId;
          else if (this.designerService.informationRequestModel.DeliverableId != undefined && this.designerService.informationRequestModel.DeliverableId != '' && this.designerService.informationRequestModel.DeliverableId != ValueConstants.DefaultId)
            answerDetails.deliverableId = this.designerService.informationRequestModel.DeliverableId;

          //to do move this code to separate api 
          // if (this.designerService.informationRequestModel.Id == "" || this.designerService.informationRequestModel.Id == null) {
          let filesData = formGroup.controls['files'].value as FileData[];
          if (filesData != null || filesData == []) {
            filesData.forEach((f) => {
              if (f.fileFormData != null) {
                let index = -1;
                index = this.fileIds.findIndex(y => y == f.id);

                f.fileFormData.set("questionnariesId", answerDetails.questionnairesId);
                f.fileFormData.set("questionId", answerDetails.questionId);
                f.fileFormData.set("templateId", answerDetails.templateId);
                f.fileFormData.set("deliverableId", answerDetails.deliverableId);
                if (index == -1) {
                  this.fileIds.push(f.id);
                  this.designerService.attachmentsFormData.push(f.fileFormData);
                }
              }
            });
          }
          else if (formGroup.controls['type'].value == QuestionType.TableType) {
            if (this.editedTableData.length > 0) {
              for (let i = 0; i < this.editedTableData.length; i++) {
                this.tableQuestionIds.forEach((item) => {
                  if (item.id == this.editedTableData[i].id && item.value !== this.editedTableData[i].innerText) {
                    let index = this.answeredCellValues.findIndex(x => x.id == this.editedTableData[i].id);
                    if (index >= 0) {
                      this.answeredCellValues.splice(index, 1);
                    }
                    let cellObject = new CellValue();
                    cellObject.id = this.editedTableData[i].id;
                    cellObject.key = item.key;
                    cellObject.value = this.editedTableData[i].innerHtml;
                    cellObject.isEditable = true;
                    cellObject.childTag = item.childTag;
                    this.answeredCellValues.push(cellObject);
                  }
                });
              }
            }
            answerDetails.cellValue = this.answeredCellValues;
          }
          else if (formGroup.controls['type'].value == QuestionType.TableType) {
            if (this.editedTableData.length > 0) {
              for (let i = 0; i < this.editedTableData.length; i++) {
                this.tableQuestionIds.forEach((item) => {
                  if (item.id == this.editedTableData[i].id && item.value !== this.editedTableData[i].innerText) {
                    let index = this.answeredCellValues.findIndex(x => x.id == this.editedTableData[i].id);
                    if (index >= 0) {
                      this.answeredCellValues.splice(index, 1);
                    }
                    let cellObject = new CellValue();
                    cellObject.id = this.editedTableData[i].id;
                    cellObject.key = item.key;
                    cellObject.value = this.editedTableData[i].innerHtml;
                    cellObject.isEditable = true;
                    cellObject.childTag = item.childTag;
                    this.answeredCellValues.push(cellObject);
                  }
                });
              }
            }
            answerDetails.cellValue = this.answeredCellValues;
          }
          else {
            if (lastAnswer == formGroup.controls['answer'].value) {
              answerDetails.answer = formGroup.controls["answer"].value;
              answerDetails.answerId = formGroup.controls["answerId"].value;
              // this.isAnswerChanged = false;
              // answerDetails.answer = null
            }
            else {
              answerDetails.answer = formGroup.controls["answer"].value;
              answerDetails.answerId = formGroup.controls["answerId"].value;
            }
          }

          answerDetails.type = formGroup.controls['type'].value;
          if (this.designerService.informationRequestModel.DeliverableId != '')
            answerDetails.deliverableId = this.designerService.informationRequestModel.DeliverableId;
          if (this.commentsUnSaved.length >= i + 1) {
            if (this.designerService.savedComments.length >= i + 1 && this.designerService.savedComments[i].comments.length > 0) {
              this.commentsUnSaved[i].comments.forEach(
                (unsavedComment) => {
                  this.designerService.savedComments[i].comments.push(unsavedComment);
                }
              )
              answerDetails.comments = this.designerService.savedComments[i].comments;
            }
            else {

              for (let k = i; k <= i; k++) {
                let emptysavedComment = new CommentsViewModelArray();
                this.designerService.savedComments.push(emptysavedComment);
              }

              this.commentsUnSaved[i].comments.forEach(
                (unsavedComment) => {
                  this.designerService.savedComments[i].comments.push(unsavedComment);
                }
              )
              if (this.designerService.savedComments[i].comments.length > 0) {

                answerDetails.comments = this.designerService.savedComments[i].comments;
              }
            }
          }
          if (this.designerService.savedComments.length >= i + 1 && this.designerService.savedComments[i].comments.length > 0) {
            answerDetails.comments = this.designerService.savedComments[i].comments;
          }
          if (this.isAnswerChanged) {
            this.answerDetails.push(answerDetails);
          }
          this.designerService.informationRequestModel.AnswerDetails = this.answerDetails;
        }
      }
    }
  }

  getQuestions(event) {
    this.selectedAnswerAvailableViewModel.questionName = event.controls.title.value;
    this.selectedAnswerAvailableViewModel.questionnariesId = event.controls.questionnairesId.value;
    this.selectedAnswerAvailableViewModel.questionId = event.controls.questionId.value;
    this.selectedAnswerAvailableViewModel.templateOrDeliverableId = this.templateDeliverableId;
    this.selectedAnswerAvailableViewModel.isTemplate = this.isTemplate;
    this.selectedAnswerAvailableViewModel.questionType = event.controls.type.value;
  }

  popupForwardMail(question) {
    // this.designerService.DisableBCCBtn = true;
    this.designerService.isForwardMail = true;
    let questionIdMdl = new QuestionIdsViewModel();
    questionIdMdl.QuestionnarieId = question.controls[createInfoLabels.QuestionnairesId].value;
    questionIdMdl.QuestionId = this.designerService.selectedQuestionIds[0];
    this.result.push(questionIdMdl);
    this.nbDialogService.open(SendmailUserComponent, {
      closeOnBackdropClick: false,
      closeOnEsc: true,
      context: { section: this.result }
    });

  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.designerService.selectedQuestionTitle = [];
    this.designerService.questionIdsViewModel = [];
  }

  onEditQuestionClick(question) {
    this.designerService.editquestionClicked = true;
    this.editquestionClick = true;
    this.editableQuestionIds = [];
    let SelquestionId = question.controls['questionId'].value;
    this.selQuestionData = this.questionList.filter(x => x.questionId == SelquestionId);
    this.designerService.editQuestionIds.push(SelquestionId);
    this.editableQuestionIds.push(SelquestionId);
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.populateQuestions).publish(this.selQuestionData);
  }

  checkedQuestionForEdit(questionId) {
    let data = this.editableQuestionIds.filter(x => x == questionId);
    if (data && data.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  toggleCheckbox(event, question) {
    let tmp = new QuestionIdsViewModel();
    let mdlForTitle = new QuestionTitleModel();
    mdlForTitle.questionId = tmp.QuestionId = question.controls.questionId.value
    mdlForTitle.questionarieId = tmp.QuestionnarieId = question.controls.questionnairesId.value;
    mdlForTitle.title = question.controls.title.value;
    // mdlForTitle.isForwarded=question.controls.isForwarded.value;
    var orgDetails = this.shareDetailService.getORganizationDetail();
    tmp.projectId = orgDetails.projectId;
    if (event.currentTarget.checked) {
      this.selectedQuestions.push(tmp);
      this.selectedQuestionTitle.push(mdlForTitle);
    }
    else {
      this.selectedQuestions.splice(this.selectedQuestions.indexOf(tmp), 1);
      this.selectedQuestionTitle.splice(this.selectedQuestionTitle.indexOf(mdlForTitle), 1);
    }
    this.designerService.questionIdsViewModel = this.selectedQuestions;
    this.designerService.selectedQuestionTitle = this.selectedQuestionTitle;
  }
  AccessRights() {
    if (this.designerService.docViewAccessRights) {
      this.userAccessRights = this.designerService.docViewAccessRights;
    }
    this.infoGatheringIcons = new InfoGatheringIcons();
    const project = this.shareDetailService.getORganizationDetail();
    this.taskService.getuserinformationrequestbyprojectId(project.projectId).subscribe((data) => {
      if (data.length == 0)
        this.infoGatheringIcons.HideNotApplicable = true;
      data.forEach(element => {
        if (this.designerService.infoRequestId != undefined && this.designerService.infoRequestId != '') {
          if (element.informationRequest == this.designerService.infoRequestId) {
            if (element.isAssignTo && this.designerService.infoRequestStatus == InfoRequestStatus.InProgress) {
              this.infoGatheringIcons.EnableApproveRejectAssignee = true;
              this.infoGatheringIcons.EnableForwardIcon = true;
              this.infoGatheringIcons.EnableNotApplicable = true;
            }
            else if (element.isCoReviewer || element.isCreator) {
              if (this.designerService.infoRequestStatus == InfoRequestStatus.Review || this.designerService.infoRequestStatus == InfoRequestStatus.Final) {
                this.infoGatheringIcons.EnableApproveRejectReviewer = true;
                this.infoGatheringIcons.EnableViewHistory = true;
                this.infoGatheringIcons.EnableEditQuestion = true;
                if (this.designerService.infoRequestStatus == InfoRequestStatus.Review && element.isAssignTo)
                  this.creatorNotApplicable = true;
                // this.infoGatheringIcons.EnableNotApplicable=true;
                else
                  this.infoGatheringIcons.ShowNotApplicable = true;
              }
              else if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress) {
                this.infoGatheringIcons.DisablePageForReviewWhenInProgress = true;
              }
            }
            if (this.designerService.infoRequestStatus == InfoRequestStatus.Draft)
              this.infoGatheringIcons.HideNotApplicable = true;
          }
        }
        else
          this.infoGatheringIcons.HideNotApplicable = true;
      });
    });
  }
  NotApplicable(question) {
    let mdl = new ApproveOrRejectDataModel();
    mdl.informationRequestId = this.designerService.infoRequestId; //question.controls.informationRequestId.value;
    mdl.questionnairesId = question.controls.questionnairesId.value;
    mdl.questionId = question.controls.questionId.value;
    mdl.isNotApplicable = !question.controls.isNotApplicable.value;
    if (this.designerService.percentageCalculations.length > 0) {
      this.designerService.percentageCalculations = [];
    }
    if (this.designerService.ViewedIsTemplate) {
      mdl.templateId = this.designerService.ViewedTemplateOrDelieverable;
    } else {
      mdl.deliverableId = this.designerService.ViewedTemplateOrDelieverable;
    }
    mdl.status = this.designerService.infoRequestStatus;
    let tmp = mdl.isNotApplicable;
    this.infoGatheringService.notApplicable(mdl).subscribe(response => {
      if (response.status === ResponseStatus.Sucess) {
        if (tmp) {
          this.infoGatheringIcons.EnableNotApplicable = false;
          this.toastr.success(this.translate.instant('screens.project-user.NotApplicableMessage'));

        }
        else {
          this.infoGatheringIcons.EnableNotApplicable = true;
          this.toastr.success(this.translate.instant('screens.project-user.NotApplicableMessage-Unmark'));

        }
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.loadQuestionAnswerAfterSave).publish("reload");
      }
      else {
        this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
      }
    },
      error => {
        this.dialogService.Open(DialogTypes.Warning, error.message);
      })
  }
  AccessRightsAddToAppendix() {
    if (this.designerService.docViewAccessRights) {
      this.userAccessRights = this.designerService.docViewAccessRights;
    }
    const project = this.shareDetailService.getORganizationDetail();
    this.taskService.getuserinformationrequestbyprojectId(project.projectId).subscribe((data) => {
      data.forEach(element => {
        if (this.designerService.infoRequestId != undefined && this.designerService.infoRequestId != '') {
          if (element.informationRequest == this.designerService.infoRequestId) {
            if (element.isAssignTo && (this.designerService.infoRequestStatus == InfoRequestStatus.Draft || this.designerService.infoRequestStatus == InfoRequestStatus.InProgress)) {
              this.settings = this.settings0;
            }
            else if (element.isCoReviewer || element.isCreator) {
              if (this.designerService.infoRequestStatus == InfoRequestStatus.Review || this.designerService.infoRequestStatus == InfoRequestStatus.Final) {
                this.settings = this.settings1;
              }
              else if (this.designerService.infoRequestStatus == InfoRequestStatus.InProgress || this.designerService.infoRequestStatus == InfoRequestStatus.Draft) {
                this.settings = this.settings0;
              }
              else if (this.designerService.infoRequestStatus == InfoRequestStatus.Draft) {
                this.settings = this.settings0;
              }
            }
          }
          else {
            this.settings = this.settings0;
          }
        }
        else {
          this.settings = this.settings0;
        }
      });
    });
  }

  uploadFileTableType(files, index) {
    if (files.length > 0) {
      const file = files[0];
      document.getElementById("fileName").innerText = file.name;
      this.selectedfile = file;
    }
  }

  onSubmit() {
    const file = new FormData();
    const project = this.shareDetailService.getORganizationDetail();
    file.append('projectId', project.projectId)
    file.append('file', this.selectedfile, this.selectedfile.name);
    //Start loader
    //this.ngxLoader.startBackgroundLoader(this.loaderId);
    // this.taskService.upload(file).subscribe(
    //   response => {
    //     var res = response;
    //       this.ngxLoader.stopBackgroundLoader(this.loaderId);

    //     if (response.status === ResponseStatus.Sucess) {
    //       this.dialogService.Open(DialogTypes.Success, this.translate.instant('screens.project-user.FileUploadSuccessMessage'));
    //       this.downloadFileTableType(this.convertbase64toArrayBuffer(res.tag));
    //     } else {
    //       this.dialogService.Open(DialogTypes.Warning, response.errorMessages[0]);
    //     }
    //   });
  }

  downloadFileTableTypeQuestions() {
    // this.ngxLoader.startBackgroundLoader(this.loaderId);
    // this.taskService.downloadTableType(this.selectedfile.name).subscribe(data => {
    //   this.downloadFile(this.convertbase64toArrayBuffer(data.content), data.fileName);
    //   this.ngxLoader.stopBackgroundLoader(this.loaderId);
    // }),
    //   error => {
    //     this.dialogService.Open(DialogTypes.Warning, error.message);
    //     this.ngxLoader.stopBackgroundLoader(this.loaderId);
    //   },

    //   () => console.info('OK');
    // return false;
  }

  convertbase64toArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  downloadFileTableType(data) {
    try {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, this.selectedfile.name);
      }
      else {
        var a = document.createElement("a");
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.selectedfile.name;
        a.click();
      }
    }
    catch{
      this.dialogService.Open(DialogTypes.Warning, this.translate.instant('screens.project-user.DownloadFailureMessage'));
    }
  }

  percentageCalulation(lastAnswer, currentValue, defaultNullValue, questionId, blockType, isAttachment) {
    // Percentage Calculation logic 
    // isNextorPrevious (on click on next or previous / block type page click)
    //Increase
    if (lastAnswer == undefined || lastAnswer == "") {
      if (currentValue != defaultNullValue) {
        if (this.designerService.percentageCalculations.length > 0) {
          let questionExist = this.designerService.percentageCalculations.find(x => x.questionId == questionId);
          if (questionExist == undefined) {
            let percentage = new PercentageCalculation();
            percentage.questionId = questionId;
            percentage.count = 1,
              percentage.isIncreased = true;
            percentage.blockType = blockType;
            this.designerService.percentageCalculations.push(percentage);
          }
        } else {
          let percentage = new PercentageCalculation();
          percentage.questionId = questionId;
          percentage.count = 1,
            percentage.isIncreased = true;
          percentage.blockType = blockType;
          this.designerService.percentageCalculations.push(percentage);
        }

      } else {
        let questionExist = this.designerService.percentageCalculations.findIndex(x => x.questionId == questionId);
        if (questionExist != -1) {
          this.designerService.percentageCalculations.splice(questionExist, 1);
        }
        //For attachments
        if (isAttachment) {
          let percentage = new PercentageCalculation();
          percentage.questionId = questionId;
          percentage.count = 1,
            percentage.isIncreased = true;
          percentage.blockType = blockType;
          this.designerService.percentageCalculations.push(percentage);
        }
      }
    }

    //Decrease
    if (lastAnswer != undefined && lastAnswer != "") {
      if (currentValue == defaultNullValue) {
        if (this.designerService.percentageCalculations.length > 0) {
          let questionExist = this.designerService.percentageCalculations.find(x => x.questionId == questionId);
          if (questionExist == undefined) {
            let percentage = new PercentageCalculation();
            percentage.questionId = questionId;
            percentage.count = 1,
              percentage.isIncreased = false;
            percentage.blockType = blockType;
            this.designerService.percentageCalculations.push(percentage);
          }
        } else {
          let percentage = new PercentageCalculation();
          percentage.questionId = questionId;
          percentage.count = 1,
            percentage.isIncreased = false;
          percentage.blockType = blockType;
          this.designerService.percentageCalculations.push(percentage);
        }
      } else {
        let questionExist = this.designerService.percentageCalculations.findIndex(x => x.questionId == questionId);
        if (questionExist != -1) {
          this.designerService.percentageCalculations.splice(questionExist, 1);
        }
      }
    }
  }

  disableCommand(cmd) {
    cmd.on('set:isEnabled', this.forceDisable, { priority: 'highest' });
    cmd.isEnabled = false;

    // Make it possible to enable the command again.
    return () => {
      cmd.off('set:isEnabled', this.forceDisable);
      cmd.refresh();
    };
  }

  forceDisable(evt) {
    evt.return = false;
    evt.stop();
  }

}
