import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheMapService } from '../../shared/services/cache/cache-map.service';

const CACHABLE_URLS: string[] = [
    '/projectsetup/api/common/getgups',
    '/projectsetup/api/common/getindustries',
    '/projectsetup/api/common/getusecases',
    '/projectsetup/api/common/getallreporttiers',
    '/projectsetup/api/common/getallcurrencies',
    '/projectsetup/api/common/getAllTransactionTypes',
    '/projectdesigner/api/block/blockfilter',
    '/projectdesigner/api/block/getblocktype',
    '/projectdesigner/api/library/getlibrarytypes',
    '/projectdesigner/api/library/blockcategories',
    '/projectdesigner/api/question/getquestiontype',
    '/projectdesigner/api/block/getblockmasterdata',
  ];

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
    constructor(private cache: CacheMapService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRequestCachable(req)) {
           return next.handle(req);
        }
        const cachedResponse = this.cache.get(req);
        if (cachedResponse !== null) {
           return of(cachedResponse);
        }
        return next.handle(req).pipe(
           tap(event => {
              if (event instanceof HttpResponse) {
                this.cache.put(req, event);
              }
           })
        );
    }

    private isRequestCachable(req: HttpRequest<any>) {
        const url = this.toLocation(req.url).pathname;
        if((req.method === 'GET') && (CACHABLE_URLS.indexOf(url) > -1)) {
      //   console.log(req.method + ':'
      //   + url + ' : '
      //   + ((req.method === 'GET') && (CACHABLE_URLS.indexOf(url) > -1)));
        }
        return (req.method === 'GET') && (CACHABLE_URLS.indexOf(url) > -1);
      }

      private toLocation(url) {
        const a = document.createElement('a');
        a.href = url;
        return a;
      }
}
