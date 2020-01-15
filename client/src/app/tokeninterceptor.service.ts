import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokeninterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // `bearer ${this.authService.getToken()}` // 'bearer xx.yy.zz
    const newReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${this.authService.getToken()}`)
    });
    return next.handle(newReq);
  }
}
