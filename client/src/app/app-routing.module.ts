import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JsongalleryComponent } from './jsongallery/jsongallery.component';
import { ImageuploadComponent } from './imageupload/imageupload.component';
import { MyfavoritesComponent } from './myfavorites/myfavorites.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: JsongalleryComponent
  },
  {
    path: 'gallery',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'upload',
    component: ImageuploadComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'favorites',
    component: MyfavoritesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
