import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { JsongalleryService } from '../jsongallery.service';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string;
  password: string;
  loginMessage: string;
  loginForm: FormGroup;

  constructor(
    private http: HttpClient,
    private galleryService: JsongalleryService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      'email': new FormControl(this.email, [
        Validators.required,
        Validators.email
      ]),
      'password': new FormControl(this.password, [
        Validators.required,
        Validators.minLength(4)
      ])
    });
    console.log('init');
  }
  login(): void {
    if (!this.isValidInput()) { return; }
    const loginUrl = `
    http://${this.authService.config.serverHost}:${this.authService.config.serverPort}/${this.authService.config.loginRoute}`;

    console.log(loginUrl);

    const data = {email: this.email, pass: this.password};
    this.authService.login(loginUrl, data)
      .then((serverLoginResponse: any) => {
        this.authService.greeting = `Hello ${serverLoginResponse.first_name}`;
        this.authService.username = serverLoginResponse.first_name;

        console.log('serverLoginResponse: ', serverLoginResponse);
        console.log('response.message', serverLoginResponse.message);
        console.log(serverLoginResponse.token);

        this.authService.createCookie(serverLoginResponse);
        this.init();
        this.loginForm.reset();

        let redirect = this.authService.redirecturl ? this.router.parseUrl(this.authService.redirecturl) : '/favorites';
        this.router.navigateByUrl(redirect).then((res) => {
          this.authService.redirecturl = null;
          if (!res) {
            console.error('Navigation after login failed');
          }
        }, (err) => {
          console.error('Navigation error after login');
        });
      })
      .catch((serverLoginError: HttpErrorResponse) => {
        console.error(`Server login failed with response: `, serverLoginError.status, serverLoginError.statusText, ', ', serverLoginError.error.message);
        if (serverLoginError.status === 401) {
          this.loginForm.controls['password'].setErrors({invalid: true});
          this.loginForm.controls['email'].setErrors({invalid: true});
          setTimeout(() => { this.loginForm.reset(); }, 5000);
        }
      });
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
    if (this.authService.isLoggedIn()) {
      this.galleryService.load();
    } else {
      this.authService.loggedIn = false;
      this.loginForm.reset();
    }
  }

}
