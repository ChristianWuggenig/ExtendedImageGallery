import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SiteComponent} from './site/site.component';
import {JsongalleryComponent} from './jsongallery/jsongallery.component';

const routes: Routes = [
  {
    path: 'login',
    component: SiteComponent
  },
  {
    path: 'gallery',
    component: JsongalleryComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
