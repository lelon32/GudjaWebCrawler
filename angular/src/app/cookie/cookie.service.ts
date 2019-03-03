import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { CookieData, Crawl } from './cookie.model';

@Injectable({providedIn: 'root'})
export class CookieDataService {
  private cookieData: CookieData = {contents: []};

  constructor( private cookieService: CookieService) {}

  getCookieData() {
    this.cookieData = {contents: []};
    var urlHistory = this.cookieService.get("urlHistory");
    var urlHistoryObj = JSON.parse(urlHistory);

    var x;
    var crawl: Crawl = {site: "", keyword: ""};
    for (x in urlHistoryObj) {
      // Even index contains site
      if (x % 2 === 0) {
        crawl.site = urlHistoryObj[x];
        crawl.keyword = "";
      }

      // Odd index contains keyword
      else {
        crawl.keyword = urlHistoryObj[x];
        var copy = JSON.parse(JSON.stringify(crawl));
        this.cookieData.contents.push(copy);
        crawl.keyword =  "";
      }
    }

    console.log("cookieData: ", this.cookieData);
    return this.cookieData;
  }

  eraseCookie() {
    this.cookieService.set("urlHistory", "[]");
    return;
  }
}
