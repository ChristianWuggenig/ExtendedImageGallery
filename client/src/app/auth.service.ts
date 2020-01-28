import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirecturl: string; // used for redirect after successful login
  username: string;
  loginMessage: string;
  greeting = 'Hello guest!';
  loggedIn = false;
  config = {
    serverHost: 'localhost',
    serverPort: 3000,
    loginRoute: 'login',
    galleryRoute: 'gallery',
    imageRoute: 'image',
    updateRoute: 'myaccount',
    localUserInfo: 'wt18user',
    cookieExpiry: 3600000,
    standardGreeting: `Hello guest!`,
    standardUsername: 'Guest',
    logoutRoute: 'logout'
  };

  constructor(private http: HttpClient, private cookie: CookieService) { }

  login(url: string, data: { pass: string }) {
    return new Promise((resolve, reject) => {
      this.http.post(url, data, httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  logout() {
    const logouturl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.logoutRoute}`;
    return new Promise((resolve, reject) => {
      this.http.delete(logouturl, httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  isLoggedIn(): boolean {
    return this.cookie.check(this.config.localUserInfo);
  }

  getToken(): string {
    if (this.cookie.check(this.config.localUserInfo)) {
      let cookie = this.cookie.get(this.config.localUserInfo);
      return JSON.parse(cookie as string).token.token;
    } else { return ''; }
  }

  getUsername(): string {
    if (this.cookie.check(this.config.localUserInfo)) {
      let cookie = this.cookie.get(this.config.localUserInfo);
      return JSON.parse(cookie as string).first_name;
    } else { return ''; }
  }

  deleteCookie(): void {
    this.cookie.delete(this.config.localUserInfo);
  }

  createCookie(jsonData: JSON): void {
    const now = new Date();
    let time = now.getTime();
    time += this.config.cookieExpiry;
    now.setTime(time);
    this.cookie.set(this.config.localUserInfo, JSON.stringify(jsonData), now);
  }

  updateData(url: string, data: { firstName: string, lastName: string, password: string }) {
    return new Promise((resolve, reject) => {
      this.http.put(url, data, httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  getData(url: string) {
    return new Promise((resolve, reject) => {
      this.http.get(url, httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }
}
