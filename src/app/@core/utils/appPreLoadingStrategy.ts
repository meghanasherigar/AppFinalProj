import {PreloadingStrategy, Route} from "@angular/router";
import {Observable, timer, of} from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomPreloadingStrategy implements PreloadingStrategy {
    preload(route: Route, load: () => Observable<any>): Observable<any> {
        if (route.data && route.data.preload) {
            return route.data.delay? timer(150).pipe(flatMap(_ => load()))
            : load(); 
        } else {
            return Observable.of(null);
        }
    }
}
