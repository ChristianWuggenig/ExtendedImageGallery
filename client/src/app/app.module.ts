import { NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { JsongalleryComponent } from './jsongallery/jsongallery.component';
import { SiteComponent } from './site/site.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    MDBBootstrapModule.forRoot()
  ], providers: [CookieService],
  declarations: [
    AppComponent,
    JsongalleryComponent,
    SiteComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
