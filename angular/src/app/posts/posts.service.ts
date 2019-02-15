import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Post } from './post.model';
import { CrawlerData } from '../crawler/crawlerdata.model';
import { CrawlerService } from '../crawler/crawlerdata.service';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(public crawlerService: CrawlerService) {  }

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

    this.crawlerService.updateCrawlerData();
  }
}
