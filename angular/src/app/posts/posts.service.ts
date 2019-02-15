import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Post } from './post.model';
import { CrawlerData } from '../crawler/crawlerdata.model';
import { CrawlerService } from '../crawler/crawlerdata.service';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  // constructor(private http: HttpClient) { }

  constructor(public crawlerService: CrawlerService, private http: HttpClient) {  }

  getPosts() {
    return [...this.posts];
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(url: string, depth: number, algorithm: string) {
    const post: Post = {url: url, depth: depth, algorithm: algorithm};
    this.posts.push(post);
    this.postsUpdated.next([...this.posts]);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    var url = environment.baseUrl + '/data';
    this.http.post<string>(url, post, httpOptions)
      .subscribe((response) => {
        console.log("POST response: ", response);
      });

    this.crawlerService.updateCrawlerData();
  }
}
