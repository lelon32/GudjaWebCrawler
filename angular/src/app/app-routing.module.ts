import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrawlerComponent } from './crawler/crawler.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'crawler', component: CrawlerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
