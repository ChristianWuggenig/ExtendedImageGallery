import { NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { JsongalleryComponent } from './jsongallery/jsongallery.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NavbarComponent } from './navbar/navbar.component';
import { NavbarComunicationService } from './navbarComunication.service';
import { LoginComponent } from './login/login.component';
import { MyfavoritesComponent } from './myfavorites/myfavorites.component';
import { ImageuploadComponent } from './imageupload/imageupload.component';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    MDBBootstrapModule.forRoot()
  ], providers: [CookieService, NavbarComunicationService, AuthService, AuthGuard],
  declarations: [
    AppComponent,
    JsongalleryComponent,
    NavbarComponent,
    LoginComponent,
    MyfavoritesComponent,
    ImageuploadComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
