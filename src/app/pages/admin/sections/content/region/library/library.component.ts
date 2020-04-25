import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';
import { manageLibrary, AccessLibraryMenus } from '../../../../../../@models/projectDesigner/library';
import { DesignerService } from '../../../../services/designer.service';
import { Subscription } from 'rxjs';
import { LibraryOptions } from '../../../../../../@models/projectDesigner/block';
import { MultiRootEditorService } from '../../../../../../shared/services/multi-root-editor.service';
import { libraryActions } from '../../../../../../@models/admin/library';

@Component({
  selector: 'ngx-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();
  constructor(private readonly _eventService: EventAggregatorService, private designerService: DesignerService, private multiRootEditorService: MultiRootEditorService) { }
  @Input() IsGlobal: boolean;
  hideBlockAttribute: boolean = true;
  hideStackAttribute: boolean = true;
  showTrackChanges: boolean = false;
  hideQuestion: boolean = true;
  hideQuestionList: boolean = true;
  selectedDesignerTab: any = 1;
  showStylePanel : boolean = false;

  ngOnInit() {
    this.designerService.selectedDesignerTab.subscribe(selectedTab => {
      this.selectedDesignerTab = selectedTab;
    });
    this.showTrackChanges = this.multiRootEditorService.isTrackChangesEnabled;
    this.designerService.isGLobal = this.IsGlobal;
    const menuAccess = new AccessLibraryMenus();
    menuAccess.createStack = false;
    menuAccess.copy = false;
    menuAccess.remove = false;
    menuAccess.ungroup = false;
    menuAccess.attribute = false;
    this.designerService.changeAccessMenus(menuAccess);
    if (!this.designerService.SelectedOption) {
      this.designerService.SelectedOption = (this.IsGlobal) ? LibraryOptions.Globallibrary : LibraryOptions.Countrylibrary;
    }

    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.action).subscribe(data => {
      if (data === 'toggleblockattributecomponent') {
        this.hideStackAttribute = true;
        this.hideBlockAttribute = !this.hideBlockAttribute;
      } else if (data === 'togglestackckattributecomponent') {
        this.hideBlockAttribute = true;
        this.hideStackAttribute = !this.hideStackAttribute;
      }
      else if (data == libraryActions.CreateQuestion) {
        this.hideQuestion = false;
        if (this.hideQuestion) {
          this.hideQuestionList = true;
        }
        else {
          this.hideQuestionList = false;
        }
      }
      else if (data == libraryActions.toggleCreateQuestion) {
        this.hideQuestion = true;
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
    }));
  }
  checkQuestionList() {
    if (this.hideQuestionList == true && this.selectedDesignerTab == 5) {
      return false;
    }
    else {
      return true;
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(){
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.iconicViewTemplateSection.loadLibrary).publish(true);
  }
}
