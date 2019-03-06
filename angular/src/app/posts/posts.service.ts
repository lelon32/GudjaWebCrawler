import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../environments/environment';
import { Post } from './post.model';
import { CrawlerData } from '../crawler/crawlerdata.model';
import { CrawlerService } from '../crawler/crawlerdata.service';

@Injectable({providedIn: 'root'})
export class PostsService {
  private status;
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

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
      .subscribe((response) => {
        this.status = this.cookieService.get("keywordFoundURL");
        this.crawlerService.updateKeywordFoundURL(this.status);
        this.crawlerService.updateCrawlerData(response);
      });
  }
}
