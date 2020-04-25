import { Injectable } from '@angular/core';
import { IAggregateEvent, AggregateEvent, AggregateEventItem } from './event';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { AppliConfigService } from '../../../shared/services/appconfig.service';
import { EntityFilterViewModel } from '../../../@models/entity';
import { KfsResponse } from '../../../@models/ResponseStatus';

/**
 * For inter component communication throughout application.
 * Use dependency injection to raise an event with payload.
 * NOTE: All subscriptions to be unsubscribed at ngOnDestroy() method of subscribing component
 */
@Injectable({
  providedIn: 'root',
})
export class EventAggregatorService {

    private changeEvents: AggregateEventItem[] = [];

    constructor(private http: HttpClient, private appConfig: AppliConfigService) { }

    public getEvent<T>(key: string): IAggregateEvent<T> {
      const match = this.changeEvents.find(e => e.key === key);
      if(match != null && match !== undefined ) {
        return match.event;
      }

      const eventItem = new AggregateEventItem();
      eventItem.key = key;
      eventItem.event = new AggregateEvent<T>();
      this.changeEvents.push(eventItem);
        return eventItem.event;
    }

    download_Entities(viewModel: EntityFilterViewModel) {
      return this.http.post<KfsResponse>(this.appConfig.ApiProjectSetupUrl() + "/api/entities/downloadentity/",viewModel);
    }

}
