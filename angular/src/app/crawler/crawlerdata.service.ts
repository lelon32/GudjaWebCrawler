import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { CrawlerData } from './crawlerdata.model';

@Injectable({providedIn: 'root'})
export class CrawlerService {
  private crawlerData: CrawlerData = {nodes: [], edges: []};
  private crawlerDataUpdated = new Subject<CrawlerData>();

  constructor(private http: HttpClient) { }

  getCrawlerData() {
    return this.crawlerData;
  }

  updateCrawlerData(data_from_post) {
    var url = environment.baseUrl + '/data';
    this.crawlerData = data_from_post;
    this.crawlerDataUpdated.next(this.crawlerData);
  }

  getCrawlerUpdateListener() {
    return this.crawlerDataUpdated.asObservable();
  }
}
