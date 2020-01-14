import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { SiteService } from '../site.service';
import { JsongalleryService } from '../jsongallery.service';
import {log} from 'util';
import {NavbarComunicationService} from "../navbarComunication.service";

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.css']
})
export class SiteComponent implements OnInit {
  greeting = 'Hello guest!';
  loggedIn = false;
  email: string;
  password: string;
  loginMessage: string;
  loginForm: FormGroup;
  config = {
    serverHost: 'localhost',
    serverPort: 3000,
    loginRoute: 'login',
    galleryRoute: 'gallery',
    imageRoute: 'image',
    localUserInfo: 'wt18user',
    cookieExpiry: 3600000,
    standardGreeting: `Hello guest!`
  };
  constructor(
    private http: HttpClient,
    private galleryService: JsongalleryService,
    private siteService: SiteService,
    private cookie: CookieService,
    private navbarCommunicationService: NavbarComunicationService
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'email': new FormControl(this.email, [
        Validators.required,
        Validators.email
      ]),
      'password': new FormControl(this.password, [
        Validators.required,
        Validators.minLength(2)
      ])
    });
    console.log('init');
  }
  login(): void {
    if (!this.isValidInput()) { return; }
    const loginUrl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.loginRoute}`;

    console.log(loginUrl);

    const data = {email: this.email, pass: this.password};
    this.siteService.login(loginUrl, data).subscribe((serverLoginResponse: any) => {
      this.greeting = `Hello ${serverLoginResponse.first_name}`;
      this.navbarCommunicationService.inputChanged(serverLoginResponse.first_name);
      console.log(serverLoginResponse.message);
    });
    // if (!this.isValidInput()) { return; }
    // const loginUrl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.loginRoute}/${this.email}`;
    // console.log(loginUrl);
    // const data = {'pass': this.password};
    // // tslint:disable-next-line:no-shadowed-variable
    // this.siteService.login(loginUrl, data).subscribe((data: any) => {
    //   this.loginMessage = data.message;
    //       if (data.status === 200) {
    //           this.createCookie(data.Data);
    //           this.loggedIn = true;
    //           this.init(); // call on success
    //           console.log(this.loginMessage);
    //       }
    // });
  }
  createCookie(jsonData: JSON): void {
    const now = new Date();
    let time = now.getTime();
    time += this.config.cookieExpiry;
    now.setTime(time);
    this.cookie.set(this.config.localUserInfo, JSON.stringify(jsonData), now);
  }
  logout(): void {
    this.deleteCookie();
    this.loggedIn = false;
    this.loginMessage = '';
    this.greeting = this.config.standardGreeting;
    this.loginForm.reset();
    this.galleryService.deinit();
  }
  deleteCookie(): void {
    this.cookie.delete(this.config.localUserInfo);
  }
  isValidInput(): Boolean {
    if (this.loginForm.valid) {
      this.email = this.loginForm.get('email').value;
      this.password = this.loginForm.get('password').value;
      return true;
    }
    return false;
  }
  init(): void {
    if (this.cookie) {
      const cookieData = JSON.parse(this.cookie.get(this.config.localUserInfo));
      this.greeting = `Hello ${cookieData.first_name} ${cookieData.last_name}!`;
      this.galleryService.load();
    } else {
      this.loggedIn = false;
      this.loginForm.reset();
    }
  }
}
