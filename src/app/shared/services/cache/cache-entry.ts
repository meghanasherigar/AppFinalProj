import { HttpResponse } from '@angular/common/http';

export interface CacheEntry {
    url: string;
    response: HttpResponse<any>;
    entryTime: number;
}

// one day as expiration time for cache
export const MAX_CACHE_AGE = 86400000; // in milliseconds