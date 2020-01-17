import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
    private authService: AuthService) { }

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
    const loginUrl = `
    http://${this.authService.config.serverHost}:${this.authService.config.serverPort}/${this.authService.config.loginRoute}`;

    console.log(loginUrl);

    const data = {email: this.email, pass: this.password};
    this.authService.login(loginUrl, data).subscribe((serverLoginResponse: any) => {
      this.authService.greeting = `Hello ${serverLoginResponse.first_name}`;
      this.authService.username = serverLoginResponse.first_name;

      console.log(serverLoginResponse);
      console.log(serverLoginResponse.message);
      console.log(serverLoginResponse.token);

      this.authService.createCookie(serverLoginResponse);
      this.init();
      this.loginForm.reset();
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
