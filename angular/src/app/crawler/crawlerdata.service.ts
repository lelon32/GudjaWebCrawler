import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CrawlerData } from './crawlerdata.model';

@Injectable({providedIn: 'root'})
export class CrawlerService {
  private crawlerData: CrawlerData = {nodes: [], edges: []};
  private crawlerDataUpdated = new Subject<CrawlerData>();

  constructor(private http: HttpClient) { }

  getCrawlerData() {
    return this.crawlerData;
  }

  updateCrawlerData() {
    var url = 'http://127.0.0.1:3000/data';
    this.http.get<CrawlerData>(url)
      .subscribe((data) => {
        this.crawlerData = data;
        this.crawlerDataUpdated.next(this.crawlerData);
      });
  }

  getCrawlerUpdateListener() {
    return this.crawlerDataUpdated.asObservable();
  }
}
