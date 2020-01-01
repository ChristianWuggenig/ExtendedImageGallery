import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Image } from './image';

@Injectable({
  providedIn: 'root'
})
export class JsongalleryService {
  config = {
    serverHost: "localhost",
    serverPort: 3000,
    loginRoute: "login",
    galleryRoute: "gallery",
    imageRoute: "image",
    localUserInfo: "wt18user",
    cookieExpiry: 3600000,
    standardGreeting: `Hello guest!`
  }
  images: Image[] = [];
  jsonImages:JSON;
  constructor(private http: HttpClient,private cookie: CookieService) { }
  load():void{
    const galleryUrl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.galleryRoute}`;
    if(this.cookie){
      let cookieData = JSON.parse(this.cookie.get(this.config.localUserInfo));
      let httpOptions = {headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': cookieData.token + ''
        })
      };
      this.http.get(galleryUrl,httpOptions)
      .pipe(
        catchError(this.handleError)  
      ).subscribe((data:any) => {
        let jsonData = JSON.parse(data);
        Object.keys(jsonData).forEach(
          (key) => {
            let image = new Image(key,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataBig}`,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataSmall}`,
              jsonData[key].description)
            this.images.push(image);
          }
        );
      });
    }
  }
  updateDesc(imgId:string, desc:string){
    let imageUrl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${imgId}`;
    if(this.cookie){
      let cookieData = JSON.parse(this.cookie.get(this.config.localUserInfo));
      let httpOptions = {headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': cookieData.token + ''
        })
      };
      let jsonData = {"description":desc};
      return this.http.patch(imageUrl, JSON.stringify(jsonData),httpOptions)
      .pipe(catchError(this.handleError)).subscribe(
        (data:any) => {
          if(data.message == "successful description update!"){
            this.images[this.getImgIdx(imgId)].desc = desc;
          }
        }
      );
    }
  }
  getImgIdx(id:string):number{
    for(let i = 0; i < this.images.length; i++){
      if(id == this.images[i].id){
        return i;
      }
    }
  }
  deinit():void{
    console.log('Bye bye :p');
    this.images = [];
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
  };
}
