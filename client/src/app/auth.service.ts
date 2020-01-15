import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loginMessage: string;
  greeting = 'Hello guest!';
  loggedIn = false;
  config = {
    serverHost: 'localhost',
    serverPort: 3000,
    loginRoute: 'login',
    galleryRoute: 'gallery',
    imageRoute: 'image',
    localUserInfo: 'wt18user',
    cookieExpiry: 3600000,
    standardGreeting: `Hello guest!`,
    standardUsername: 'Guest'
  };

  constructor(private http: HttpClient, private cookie: CookieService) { }

  login(loginUrl: any, body: { pass: string }) {
    return this.http.post(loginUrl, body, httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  }
  isLoggedIn(): boolean {
    return this.cookie.check(this.config.localUserInfo);
  }
  getToken(): string {
    if (this.cookie.check(this.config.localUserInfo)) {
      let cookie = this.cookie.get(this.config.localUserInfo);
      return JSON.parse(cookie as string).token;
    } else { return ''; }
  }
}
