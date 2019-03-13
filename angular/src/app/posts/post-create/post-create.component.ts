import { Component } from '@angular/core';
import { NgForm } from "@angular/forms";

import { Post } from '../post.model';
import { PostsService } from '../posts.service';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css', '../../app.component.css']
})
export class PostCreateComponent {
  bfsStatus: boolean = false;
  depthOk: boolean = true;
  minDepth: number = 1;
  maxDepthBFS: number = 4;
  maxDepthDFS: number = 100;

  bfsStatusTrue() {
    this.bfsStatus = true;
  }

  bfsStatusFalse() {
    this.bfsStatus = false;
  }

  checkDepth(depth) {
    // Depth less than 1
    if (depth.viewModel < this.minDepth) { this.depthOk = false;}
    else {
      // Depth too high for BFS
      if (this.bfsStatus && depth.viewModel > this.maxDepthBFS) { this.depthOk = false;}

      // Depth too high for DFS
      else if  (!this.bfsStatus && depth.viewModel > this.maxDepthDFS) { this.depthOk = false;}

      // Depth Ok
      else { this.depthOk = true;}
    }

    // console.log("depthOk: ", this.depthOk);
  }

  constructor(public postsService: PostsService) {}

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postsService.addPost(form.value.url, form.value.depth,
      form.value.algorithm, form.value.keyword);
    form.resetForm();
  }
}
