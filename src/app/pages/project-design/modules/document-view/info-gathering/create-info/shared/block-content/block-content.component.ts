import { Component, OnInit, Input, PipeTransform, Pipe, OnDestroy } from '@angular/core';
import { BlockBasicDetails, BlockType } from '../../../../../../../../@models/projectDesigner/block';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventAggregatorService } from '../../../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../../../@models/common/eventConstants';
@Component({
  selector: 'ngx-block-content',
  templateUrl: './block-content.component.html',
  styleUrls: ['./block-content.component.scss']
})
export class BlockContentComponent implements OnInit {
  loadedBlockContent: BlockBasicDetails = new BlockBasicDetails();
  isNoBlockContent: boolean = false;
  @Input()
  blockDetails: BlockBasicDetails[];
  subscriptions: Subscription = new Subscription();
  constructor(private _eventService: EventAggregatorService) { }

  ngOnInit() {
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockContentLoaded).subscribe((payload) => {
      this.blockDetails = payload as BlockBasicDetails[];
      this.handleNull();
    }))
    this.subscriptions.add(this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.infogathering.blockType).subscribe((payload) => {
      let blockType = payload as BlockType;
      if (this.blockDetails != undefined && this.blockDetails.length > 0) {
        this.handleNull();
        if (this.blockDetails.find(x => x.blockTypeId == blockType.blockTypeId) != null) {
          this.isNoBlockContent = false;
          this.loadedBlockContent = Object.assign({}, this.blockDetails.find(x => x.blockTypeId == blockType.blockTypeId))
        }
      }
      else {
        this.isNoBlockContent = true;
        this.loadedBlockContent = null;
      }
    }))
  }
  handleNull()
  {
    this.blockDetails.forEach(x => {
      x.description = (x.description == '<p>null</p>' || x.description == null) ? '' : x.description;
    })
  }
}

