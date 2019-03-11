import { Component, ViewChild } from "@angular/core";
import { MatTable } from '@angular/material';

import { CookieData } from './cookie.model';
import { CookieDataService } from './cookie.service';

@Component({
  selector: 'app-cookie',
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.css', '../app.component.css']
})

export class CookieComponent {
  public show = false;
  cookieData = null;
  contents = null;

  displayedColumns: string[] = ['site', 'keyword'];
  @ViewChild(MatTable) table: MatTable<any>;

  constructor( private cookieDataService: CookieDataService) {}

  hideTable() {
    this.show = false;
  }

  deleteData() {
    this.cookieDataService.eraseCookie();
    this.refreshData();
  }

  refreshData() {
    this.cookieData = this.cookieDataService.getCookieData();
    this.contents = this.cookieData.contents;
    this.show = true;
    this.table.renderRows();
  }
}
