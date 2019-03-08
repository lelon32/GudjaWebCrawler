import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { CrawlerData } from './crawlerdata.model';

@Injectable({providedIn: 'root'})
export class CrawlerService {
  private keywordFoundURL;
  private crawlerData: CrawlerData = {nodes: [], edges: []};
  private crawlerDataUpdated = new Subject<CrawlerData>();

  getCrawlerData() {
    return this.crawlerData;
  }

  getKeywordFoundURL() {
    return this.keywordFoundURL;
  }

  updateKeywordFoundURL(status) {
    this.keywordFoundURL = status;
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
