import { Component, OnInit } from '@angular/core';
import { Symbols, ActionEnum } from '../../../../../../@models/projectDesigner/common';
import { NbDialogRef } from '@nebular/theme';
import { EventAggregatorService } from '../../../../../../shared/services/event/event.service';
import { eventConstantsEnum } from '../../../../../../@models/common/eventConstants';

@Component({
  selector: 'ngx-symbols',
  templateUrl: './symbols.component.html',
  styleUrls: ['./symbols.component.scss']
})
export class SymbolsComponent implements OnInit {
  symbols = Symbols;

  constructor(protected ref: NbDialogRef<any>,
    private readonly _eventService: EventAggregatorService) { }

  ngOnInit() {
  }

  dismiss() {
    this.ref.close();
  }
  insertSymbol(symbol) {
    let payload: any = {};
    payload.action = ActionEnum.InsertTable;
    payload.data = symbol;
    this._eventService.getEvent(eventConstantsEnum.projectDesigner.documentView.InsertAction).publish(payload);
    this.ref.close();
  }

}
