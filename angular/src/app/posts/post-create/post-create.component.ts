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
