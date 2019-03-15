import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { timeout, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Post } from './post.model';
import { CrawlerData } from '../crawler/crawlerdata.model';
import { CrawlerService } from '../crawler/crawlerdata.service';

@Injectable({providedIn: 'root'})
export class PostsService {
  private status;
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  private error: string = null;
  private errorUpdated = new Subject<string>();

  getErrorUpdateListener() {
    return this.errorUpdated.asObservable();
  }

  constructor(public crawlerService: CrawlerService,
    private http: HttpClient,
    private cookieService: CookieService) {  }

  getPosts() {
    return [...this.posts];
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(url: string, depth: number, algorithm: string, keyword: string) {
    const post: Post = {url: url, depth: depth,
      algorithm: algorithm, keyword: keyword};
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    var url = environment.baseUrl + '/data';
    this.http.post<string>(url, post, httpOptions)
      .pipe(
         timeout(600000),
         catchError(e => {
           this.error = "timeout";
           this.errorUpdated.next(this.error);
           return null;
         })
       )
      .subscribe((response: CrawlerData) => {
          if (response === null) {
            this.error = "server response null";
            this.errorUpdated.next(this.error);
          }

          else if (response.nodes === null || response.nodes.length === 0) {
            this.error = "server response data is empty";
            this.errorUpdated.next(this.error);
          }

          else {
            this.status = this.cookieService.get("keywordFoundURL");
            this.crawlerService.updateKeywordFoundURL(this.status);
            this.crawlerService.updateCrawlerData(response);
          }
        },

        err => {
          this.error = err;
          this.errorUpdated.next(this.error);
        }
      );
  }
}
