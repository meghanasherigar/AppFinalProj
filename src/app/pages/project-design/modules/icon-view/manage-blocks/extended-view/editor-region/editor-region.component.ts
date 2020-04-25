import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { DesignerService } from '../../../../../services/designer.service';
import { EventAggregatorService } from '../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum, EventConstants, NavigationSource } from '../../../../../../../@models/common/eventConstants';
import { TemplateService } from '../../../../../services/template.service';
import { TemplateResponseViewModel, TemplateViewModel, TemplateAndBlockDetails } from '../../../../../../../@models/projectDesigner/template';
import { ShareDetailService } from '../../../../../../../shared/services/share-detail.service';
import { ProjectContext } from '../../../../../../../@models/organization';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeliverableDropDownResponseViewModel, DeliverablesInput, DeliverableResponseViewModel, DeliverableMileStone, DeliverableViewModel } from '../../../../../../../@models/projectDesigner/deliverable';
import { DeliverableService } from '../../../../../services/deliverable.service';
import { LibraryService } from '../../../../../services/library.service';
import { LibraryDropdownViewModel, LibraryBlockDetails, SearchLibraryViewModel } from '../../../../../../../@models/projectDesigner/library';
import { BlockDetailsResponseViewModel, blockSelectedModel, TemplateBlockDetails } from '../../../../../../../@models/projectDesigner/block';
import { LibraryEnum, DocumentConfigurationModel, ContentTypeViewModel, LineStyleViewModel, RGBColors, BorderDetails, ActionEnum } from '../../../../../../../@models/projectDesigner/common';
import { UserRightsViewModel } from '../../../../../../../@models/userAdmin';
import { MultiRootEditorService } from '../../../../../../../shared/services/multi-root-editor.service';
import { TaskService } from '../../../../document-view/services/task.service';
import { QuestionFilterByTemplateOrDeliverableId } from '../../../../../../../@models/projectDesigner/task';
import { SubMenus } from '../../../../../../../@models/projectDesigner/designer';
import { DocumentViewService } from '../../../../../services/document-view.service';
import { ResponseStatus } from '../../../../../../../@models/ResponseStatus';
import { DialogService } from '../../../../../../../shared/services/dialog.service';
import { DialogTypes } from '../../../../../../../@models/common/dialog';

@Component({
  selector: 'ngx-editor-region',
  templateUrl: './editor-region.component.html',
  styleUrls: ['./editor-region.component.scss']
})
export class EditorRegionComponent implements OnInit, OnDestroy {
  DisplayTemplates: boolean
  DisplayBlock: boolean
  templateList: any;
  deliverableList: any;
  selectedTemplate: any;
  selectedDeliverable: any;
  projectDetails: ProjectContext;
  blockContentList = new Array();
  viewAllMode: boolean = false;
  hideAttributeIcon: boolean = true;
  deliverablesInput = new DeliverablesInput();
  templateSection: boolean = true;
  isExtendedView: boolean;
  deliverableSection: boolean = false;
  librarySection: boolean = false;
  subscriptions: Subscription = new Subscription();
  libraryList: any;
  blockCollection: any = [];
  selectedLibrary: any;
  libraryBlockDetails = new LibraryBlockDetails();
  shareDetailService: ShareDetailService
  requestModel = new SearchLibraryViewModel();
  blockContentPayload: {};
  blockSelectedModel = new blockSelectedModel();
  ShowBlockStaffing: boolean = false;
  docViewRights: UserRightsViewModel;
  selectedDesignerTab: any;
  hideQuestion: boolean = true;
  hideQuestionList: boolean = false;
  mileStone: any = [];
  selectedMilestone: any;
  showtrackChanges: boolean = true;
  globalLib: any;
  checkedHideBlock: boolean = true;
  navigationSource: string = '';
  templateOrDeliverableId: any;
  showStylePanel: boolean = false;

  constructor(private designerService: DesignerService,
    private deliverableService: DeliverableService,
    private templateService: TemplateService,
    private _eventService: EventAggregatorService,
    private sharedService: ShareDetailService,
    private libraryService: LibraryService,
    private router: Router,
    private multiRootEditorService: MultiRootEditorService,
    private taskService: TaskService,
    private elRef: ElementRef,
    private documentViewService: DocumentViewService,
    private dialogService: DialogService) { }

  ngOnInit() {
    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      if (selectedTab != SubMenus.InformationRequest)
        this.designerService.disableInfoReqTab.next(true);
      else
        this.designerService.disableInfoReqTab.next(false);
      this.selectedDesignerTab = selectedTab;
      this.designerService.selectedDocTab = selectedTab;

      this.hideOtherMiniViews(selectedTab);
    });
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).subscribe((payload: blockSelectedModel) => {
      this.enableCreateQuestion(payload);
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.Layout.blockSecHide)
      .subscribe((payload: any) => {
        this.checkedHideBlock = payload;
      }));

    this.designerService.navigationSource.subscribe(origin => {
      if (origin) {
        this.navigationSource = origin;
      } else {
        this.navigationSource = '';
      }

    });
    this.designerService.totalBlockCount = -1;
    this.getProjectMilestones();
    this.subscriptions.add(this._eventService.getEvent(EventConstants.BlockStaffingIcon).subscribe((payload) => {
      if (payload == "EnableIcon" && this.designerService.isDeliverableSection === true) {
        this.ShowBlockStaffing = true;
      }
      else {
        this.ShowBlockStaffing = false;
      }
    }));
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadTemplate).subscribe((payload: any) => {
      //this.loadTemplates(this.selectedTemplate); // document view dropdown issue fix
      if (payload) {
        this.templateService.getTemplateBlocksByTemplateId(payload.templateId).subscribe((response: TemplateBlockDetails) => {
          this.designerService.templateDetails = response.template;
          let templateBlockDetails = new TemplateAndBlockDetails();
          templateBlockDetails.template = response.template;
          templateBlockDetails.blocks = response.blocks;
          this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish(templateBlockDetails)
        });
      }
    }));
    this.projectDetails = this.sharedService.getORganizationDetail();
    if (this.designerService.docViewAccessRights) {
      this.docViewRights = this.designerService.docViewAccessRights;
    }
    if (this.designerService.LoadAllBlocksDocumentView === true) {
      this.viewAllMode = true;
      if (this.designerService.isDeliverableSection) {
        this.blockContentPayload = {
          'projectId': this.projectDetails.projectId,
          'deliverableId': this.designerService.deliverableDetails.entityId,
          'source': 'deliverable'
        };
      } else if (this.designerService.isLibrarySection === true) {
        switch (this.designerService.libraryDetails.name.toLowerCase()) {
          case LibraryEnum.global:
            this.blockContentPayload = {
              'organizationId': this.projectDetails.organizationId,
              'projectId': this.projectDetails.projectId,
              'source': LibraryEnum.global
            }
            break;
          case LibraryEnum.country:
            this.blockContentPayload = {
              'organizationId': this.projectDetails.organizationId,
              'projectId': this.projectDetails.projectId,
              'source': LibraryEnum.country
            }
            break;
          case LibraryEnum.organization:
            this.blockContentPayload = {
              'organizationId': this.projectDetails.organizationId,
              'projectId': this.projectDetails.projectId,
              'source': LibraryEnum.organization
            }
            break;
          case LibraryEnum.user:
            this.blockContentPayload = {
              'organizationId': this.projectDetails.organizationId,
              'projectId': this.projectDetails.projectId,
              'source': LibraryEnum.user
            }
            break;
          case LibraryEnum.blocks:
            this.blockContentPayload = {
              'organizationId': this.projectDetails.organizationId,
              'source': LibraryEnum.blocks
            };
            break;
        }
      }
      else {
        this.blockContentPayload = {
          'projectId': this.projectDetails.projectId,
          'templateId': this.designerService.templateDetails.templateId,
          'deliverableId': '',
          'source': 'template'
        };
      }
    }
    else {
      //Single block selected thru double-click flow
      this.designerService.isExtendedIconicView = true;
      this.viewAllMode = false;
      if (this.designerService.blockDetails == null)
        this.navigateToEditor();
    }

    if (this.designerService.isLibrarySection === true) {
      this.librarySection = true;
      this.templateSection = false;
      this.deliverableSection = false;
      this.libraryService.getlibrarytypes().subscribe((data: LibraryDropdownViewModel[]) => {
        if (!this.docViewRights.isExternalUser) {
          this.libraryList = data;
        }
        else if (this.docViewRights.isExternalUser) {
          this.libraryList = data.filter(id => id.name != EventConstants.Global && id.name != EventConstants.Country);
        }
        if (this.libraryList.filter(item => item.id == 5).length == 0) {
          let blockList = { 'id': 5, name: "Blocks", isActive: true, index: this.libraryList.length };
          this.blockCollection.push(blockList);
          //this.libraryList.push(blockList);
        }
        if (this.designerService.libraryDetails.name != "Blocks") {
          //let globalLib = this.libraryList.find(x => x.name == this.designerService.libraryDetails.name);
          this.globalLib = this.libraryList.find(x => x.name == this.designerService.libraryDetails.name);
        }
        else if (this.designerService.libraryDetails.name == "Blocks") {
          this.globalLib = this.blockCollection.find(x => x.name == this.designerService.libraryDetails.name);
        }
        this.selectedLibrary = this.globalLib;
        this.libraryBlockDetails.library = this.globalLib;
        this.requestModel.PageIndex = 1;
        this.requestModel.PageSize = 50;
        this.requestModel.isGlobal = false;
        if (!this.designerService.isDocFullViewEnabled.value) {
          this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
            this.libraryBlockDetails.blocks = data;
            this.designerService.totalBlockCount = this.libraryBlockDetails.blocks.length;
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.libraryDetails).publish(this.libraryBlockDetails);

            let _blockId: any;

            if (this.designerService.blockDetails != null && this.designerService.blockDetails.blockId)
              _blockId = this.designerService.blockDetails.blockId;
            else if (data && data.length > 0) {
              let block: any = data[0];
              this.designerService.blockDetails = block;
              _blockId = data[0].blockId;
            }

            this._eventService.getEvent("ExtendedViewContentUpdate").publish(_blockId);
          });
        }
      });
    }
    else {
      this.templateList = new Array();
      this.templateSection = false;
      this.deliverableSection = false;
      this.librarySection = false;

      this.templateService.getDefaultTemplateDeliverables(this.projectDetails.projectId).subscribe((data: TemplateResponseViewModel) => {
        this.templateList = data.templatesDropDown;
        //load deliverables data into dropdown
        this.deliverableSection = true;
        this.deliverableService.getentities(this.projectDetails.projectId).subscribe((data: DeliverableDropDownResponseViewModel) => {
          if (data) {
            this.deliverableList = data.deliverableResponse;
            if (this.designerService.entityDetails.length > 0) {
              this.selectedDeliverable = this.deliverableList.find(item => item.entityId == this.designerService.entityDetails[0].entityId);
              this.designerService.entityDetails = [];
              this.designerService.entityDetails.push(this.selectedDeliverable);
              this.designerService.deliverableDetails = this.selectedDeliverable;
              this.deliverablesInput.id = this.designerService.entityDetails[0].entityId;
              this.selectedMilestone = this.selectedDeliverable.milestone;
              if (this.designerService.isDeliverableSection) {
                this.selectedTemplate = this.selectedDeliverable;
                this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput));
                //List of Editing questions Added by Anil
                let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
                questionFilter.isTemplate = false;
                questionFilter.templateOrDeliverableId = this.selectedTemplate.entityId;
                questionFilter.projectId = this.projectDetails.projectId;
                this.designerService.questionFilterForEditOrDelete = questionFilter;
                this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
                  this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
                })
                if (this.designerService.isExtendedIconicView)
                  this.loadDeliverables(this.selectedDeliverable);

              }
            }
          }
        });
        if (this.designerService.isTemplateSection) {
          this.templateSection = true;
          this.deliverableSection = false;
          //List of Editing questions Added by Anil
          this.designerService.templateDetails = this.selectedTemplate = this.templateList.find(item => item.templateId == this.designerService.templateDetails.templateId);
          let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
          questionFilter.isTemplate = true;
          questionFilter.templateOrDeliverableId = this.selectedTemplate.templateId;
          questionFilter.projectId = this.projectDetails.projectId;
          this.designerService.questionFilterForEditOrDelete = questionFilter;
          this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
            this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
          })
          if (this.designerService.isExtendedIconicView) this.loadTemplates(this.selectedTemplate);
        }
      });

    }


    //Check if attribute view is enabled
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action)
      .subscribe(data => {
        if (data === 'toggleblockattributecomponent') {
          this.hideAttributeIcon = !this.hideAttributeIcon;
        }
        else if (data == 'toggleCreateQuestion') {
          this.hideQuestion = !this.hideQuestion;
          if (this.hideQuestion) {
            this.hideQuestionList = true;
          }
          else {
            this.hideQuestionList = false;
          }
        }
        else if (data == eventConstantsEnum.projectDesigner.documentView.Layout.toggleStylePanel) {
          this.showStylePanel = !this.showStylePanel;
        }
      });
    // this.templateService.manageTemplateReload.subscribe(() => this.reloadTemplateGrid());
    this.showtrackChanges = this.multiRootEditorService.isTrackChangesEnabled;
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableTrackChanges)
      .subscribe((isEnabled: boolean) => {
        //this.showtrackChanges = isEnabled;
      }));
    this.isExtendedView = this.designerService.isExtendedIconicView;
  }

  navigateToEditor() {
    this.closeDocumentView();
  }

  public async loadClientConfig() {
    let result =
      await this.templateService.documentViewContent(this.projectDetails.projectId, this.designerService.templateDetails.templateId);
  }

  //Method to hide additional views like attr view etc upon navigation
  private hideOtherMiniViews(selectedTab) {
    if (selectedTab !== SubMenus.Editor) {
      //Close the attribute view if not editor tab
      this.hideAttributeIcon = true;
    }
    //TODO: Add more code to hide other views
  }
  fullViewClicked() {
    let findReplaceDiv = document.getElementById('findReplaceRef');
    if (findReplaceDiv == undefined) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.DismisFindReplace).publish(ActionEnum.cancel);
    }
  }
  DropDownChangeDeliverable(event) {
    this.designerService.clear();
    let isDeliverable = this.deliverableList.find(x => x.entityId == this.selectedTemplate.entityId);
    let isTemplate = this.templateList.find(x => x.templateId == this.selectedTemplate.templateId);
    this.designerService.deliverableDetails = new DeliverableViewModel();
    this.designerService.templateDetails = new TemplateViewModel();
    if (this.selectedTemplate.entityId != undefined) {
      this.deliverableSection = true;
      this.templateSection = false;
      this.deliverablesInput.id = this.selectedTemplate.entityId;
      this.designerService.isDeliverableSection = true;
      this.designerService.isTemplateSection = false;
      this.designerService.blockList.length = 0;
      this.designerService.entityDetails = [];
      this.designerService.entityDetails.push(this.selectedTemplate);
      this.designerService.deliverableDetails = this.selectedTemplate;
      this.loadDeliverables(this.selectedTemplate);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.entityDeliverable).publish(this.deliverablesInput);
      this.designerService.deliverableDetails.deliverableId = this.selectedTemplate.entityId;
      this.designerService.entityDetails.push(this.selectedTemplate);
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.reloadHeaderFooterByTemplateId).publish(this.selectedTemplate.entityId);
      let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
      questionFilter.isTemplate = false;
      questionFilter.templateOrDeliverableId = this.selectedTemplate.entityId;
      questionFilter.projectId = this.projectDetails.projectId;
      this.designerService.questionFilterForEditOrDelete = questionFilter;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadSuggestionsCreateQuestion).publish(false)
      this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })
    }

    else if (this.selectedTemplate.templateId != undefined) {
      this.templateSection = true;
      this.deliverableSection = false;
      // let template = this.templateList[event.target.selectedIndex];
      this.designerService.templateDetails = this.selectedTemplate;
      this.designerService.blockList.length = 0;
      this.designerService.isDeliverableSection = false;
      this.designerService.isTemplateSection = true;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.reloadHeaderFooterByTemplateId).publish(this.selectedTemplate.templateId);
      this.loadTemplates(this.selectedTemplate);
      let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
      questionFilter.isTemplate = true;
      questionFilter.templateOrDeliverableId = this.selectedTemplate.templateId;
      questionFilter.projectId = this.projectDetails.projectId;
      this.designerService.questionFilterForEditOrDelete = questionFilter;
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadSuggestionsCreateQuestion).publish(true)
      this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })
    }

    let payload: any = {};
    payload.isImportEnabled = false;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconImportTransaction).publish(payload);

  }
  closeDocumentView() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.reportblockList = [];
    this.designerService.isExtendedIconicView = false;
    this.designerService.changeIsDoubleClicked(false);
    this.designerService.changeIsDocFullView(false);
    this.designerService.LoadAllBlocksDocumentView = false;
    this.designerService.templateDetails = null;
    this.designerService.deliverableDetails = null;
    if (this.designerService.libraryDetails != undefined)
      this.designerService.libraryDetails.id = null;
    this.designerService.selectedSubmenus(0);
    this.designerService.changeTabDocumentView(0);
    this.designerService.hideOrShowMenus(0);
    if (this.navigationSource === NavigationSource.MyTask) {
      this.designerService.navigation('');
      this._eventService.getEvent(EventConstants.ProjectManagementTabAccess).publish(true);
      this.router.navigate(['pages/project-management/ProjectManagementMain',
        { outlets: { primary: ['tasks'], level2Menu: ['PMTaskLevel2Menu'], topmenu: ['ProjectManagementTopMenu'] } }]);

    }
    else {
      this.router.navigate(['pages/project-design/projectdesignMain/iconViewMain',
        { outlets: { primary: ['iconViewRegion'], level2Menu: ['iconViewLevel2Menu'], topmenu: ['iconviewtopmenu'] } }]);
    }


  }

  ngOnDestroy() {
    this.designerService.blockDetails = null;
    this.designerService.blockList = [];
    this.designerService.reportblockList = [];
    this.designerService.isExtendedIconicView = false;
    this.designerService.changeIsDoubleClicked(false);
    // this.designerService.changeIsDocFullView(false);
    this.subscriptions.unsubscribe();
  }


  libraryChange(event) {
    this.designerService.filterLibraryModel.isCountry = false;
    this.designerService.filterLibraryModel.isGlobal = false;
    this.designerService.filterLibraryModel.isOrganization = false;
    this.designerService.filterLibraryModel.isPersonal = false;
    let library = this.selectedLibrary;
    this.designerService.libraryDetails = library;
    this.requestModel.isGlobal = false;
    this.requestModel.PageIndex = 1;
    this.requestModel.PageSize = 50;

    this.libraryService.getCategories().subscribe((data: BlockDetailsResponseViewModel[]) => {
      this.libraryBlockDetails.library = library;
      this.libraryBlockDetails.blocks = data;
      this.designerService.totalBlockCount = this.libraryBlockDetails.blocks.length;

      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.changelibrarydropdown).publish(this.libraryBlockDetails);
    });

    if (this.designerService.isDocFullViewEnabled != null) {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.enableIconD).publish(this.blockSelectedModel);
      this._eventService.getEvent("insertLayoutToolbarIcons" + this.designerService.selectedDocTab).publish('reload');
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
    }
  }

  loadTemplates(selectedTemplate) {
    // if (!this.viewAllMode) { why this code. have to check with avinash
    this.templateService.getTemplateBlocksByTemplateId(selectedTemplate.templateId).subscribe((data: TemplateBlockDetails) => {

      var templateBlockDetails = new TemplateAndBlockDetails();
      templateBlockDetails.template = data.template;
      this.designerService.templateDetails = data.template;
      templateBlockDetails.blocks = data.blocks;
      this.designerService.totalBlockCount = templateBlockDetails.blocks.length;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.templateDetails).publish(templateBlockDetails));
      templateBlockDetails.blocks = [];
      let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
      questionFilter.isTemplate = true;
      questionFilter.templateOrDeliverableId = selectedTemplate.templateId;
      questionFilter.projectId = this.projectDetails.projectId;
      this.designerService.questionFilterForEditOrDelete = questionFilter;
      this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
        this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
      })

      if (this.designerService.isExtendedIconicView) {
        let _blockId: any;

        if (this.designerService.blockDetails != null && this.designerService.blockDetails.blockId)
          _blockId = this.designerService.blockDetails.blockId;
        else if (data && data.blocks.length > 0) {
          let block: any = data.blocks[0];
          this.designerService.blockDetails = block;
          _blockId = data.blocks[0].blockId;
        }

        this._eventService.getEvent("ExtendedViewContentUpdate").publish(_blockId);
      }
      this.reloadDocumentView();
    });
  }
  loadDeliverables(selectedDeliverable) {
    this.designerService.deliverableDetails = selectedDeliverable;
    let deliverableInput = new DeliverablesInput();
    deliverableInput.id = selectedDeliverable.entityId;
    deliverableInput.templateId = selectedDeliverable.templateId;
    deliverableInput.templateName = selectedDeliverable.templateName;
    deliverableInput.projectId = this.projectDetails.projectId;
    this.deliverableService.getDeliverable(deliverableInput).subscribe((data: DeliverableResponseViewModel) => {
      var templateBlockDetails = new TemplateAndBlockDetails();
      templateBlockDetails.template = selectedDeliverable;
      templateBlockDetails.blocks = data.blocks;
      this.designerService.totalBlockCount = templateBlockDetails.blocks.length;
      this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.deliverableDetails).publish(templateBlockDetails));
      this.designerService.deliverableDetails.layoutStyleId = data.layoutStyleId;
      templateBlockDetails.blocks = [];

      if (this.designerService.isExtendedIconicView) {
        let _blockId: any;

        if (this.designerService.blockDetails != null && this.designerService.blockDetails.blockId)
          _blockId = this.designerService.blockDetails.blockId;
        else if (data.blocks && data.blocks.length > 0) {
          let block: any = data.blocks[0];
          this.designerService.blockDetails = block;
          _blockId = data.blocks[0].blockId;
        }

        this._eventService.getEvent("ExtendedViewContentUpdate").publish(_blockId);
      }
      if (this.designerService.deliverableDetails) {
        this.designerService.deliverableDetails.uId = data.uId;
      }
      this.reloadDocumentView();
    })
    let questionFilter = new QuestionFilterByTemplateOrDeliverableId();
    questionFilter.isTemplate = false;
    questionFilter.templateOrDeliverableId = selectedDeliverable.entityId;
    questionFilter.projectId = this.projectDetails.projectId;
    this.designerService.questionFilterForEditOrDelete = questionFilter;
    this.taskService.getAllQuestionsByTemplateOrDeliverableId(questionFilter).subscribe((data) => {
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.loadQuestionsByTemplateOrDeliverableId).publish(data);
    })

  }
  getProjectMilestones() {
    this.deliverableService.getProjectMilestones().subscribe((data: any) => {
      this.mileStone = data;
    });
  }

  enableCreateQuestion(payload: blockSelectedModel) {
    if ((payload.blockSelectCount == 1 || (this.designerService.isExtendedIconicView == true && this.designerService.blockDetails != undefined && this.designerService.blockDetails != null)) && !payload.isStack) {
      if (!this.hideQuestion) {
        this.hideQuestionList = false;
      }
    }
    else {
      this.hideQuestionList = true;
    }
  }
  manageDeliverablePopup() { }
  assignToPopup() { }
  onEditSave(value: any) {
    let deliverableMileStone: DeliverableMileStone =
    {
      deliverableId: this.selectedDeliverable.entityId,
      milestone: value
    }
    this.deliverableService.updateDeliverable(deliverableMileStone).subscribe(() => {
      this.templateList.find(x => x.entityId == this.selectedDeliverable.entityId).milestone = value;
    });

  }

  checkQuestionList() {
    if (this.hideQuestionList == true && this.designerService.selectedDocTab == SubMenus.Tasks && this.designerService.showOrHideQuestionList == true) {
      return false;
    }
    else {
      return true;
    }
  }

  reloadDocumentView() {
    if (!this.designerService.isExtendedIconicView == true)
      this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).publish('reload');
  }

}
