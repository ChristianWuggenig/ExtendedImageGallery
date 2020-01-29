import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Image } from './image';

@Injectable({
  providedIn: 'root'
})
export class JsongalleryService {
  config = {
    serverHost: 'localhost',
    serverPort: 3000,
    loginRoute: 'login',
    galleryRoute: 'gallery',
    searchRoute: 's',
    searchParameter: 'searchString',
    favoriteRoute: 'favorites',
    imageRoute: 'image',
    localUserInfo: 'wt18user',
    ratingRoute: 'rating',
    tagRoute: 't',
    commentRoute: 'comments',
    cookieExpiry: 3600000,
    standardGreeting: `Hello guest!`
  };
  images: Image[] = [];
  tags: string[] = [];
  comments: string[] = [];
  rating: string;
  constructor(private http: HttpClient, private cookie: CookieService) { }
  load(): void {
    const galleryUrl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.galleryRoute}`;
    this.http.get(galleryUrl)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        const jsonData = JSON.parse(data);
        this.images = [];
        Object.keys(jsonData).forEach(
          (key) => {
            const image = new Image(key,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataBig}`,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataSmall}`,
              jsonData[key].description);
            this.images.push(image);
          }
        );
      });
  }

  loadFavorites(): void {
    this.http.get(`http://${this.config.serverHost}:${this.config.serverPort}/${this.config.galleryRoute}/` +
      `${this.config.favoriteRoute}`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        const jsonData = JSON.parse(data);
        this.images = [];
        Object.keys(jsonData).forEach(
          (key) => {
            const image = new Image(key,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataBig}`,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataSmall}`,
              jsonData[key].description);
            this.images.push(image);
          }
        );
      });
  }

  loadTag(id: number): void {
    const url = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/` +
    `${id}/${this.config.tagRoute}`;
    this.http.get(url)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        this.tags = JSON.parse(data);
      });
  }

  loadComments(id: number): void {
    const url = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/` +
      `${id}/${this.config.commentRoute}`;
    this.http.get(url)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        this.tags = JSON.parse(data);
      });
  }


  loadRating(id: number): void {
    const url = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/` +
      `${id}/${this.config.ratingRoute}`;
    this.http.get(url)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        this.rating = JSON.parse(data);
      });
  }
  search(searchString: string): void {
    if (searchString !== '') {
      if (searchString.startsWith('#')) {
        searchString = '@' + searchString.substr(1); // use a different symbol than #, because http would recognize it as fragment
      }
    this.http.get(`http://${this.config.serverHost}:${this.config.serverPort}/${this.config.galleryRoute}/` +
      `${this.config.searchRoute}?${this.config.searchParameter}=${searchString}`)
      .pipe(
        catchError(this.handleError)
      )
      .subscribe((data: any) => {
        const jsonData = JSON.parse(data);
        this.images = [];
        Object.keys(jsonData).forEach(
          (key) => {
            const image = new Image(key,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataBig}`,
              `http://${this.config.serverHost}:${this.config.serverPort}/${jsonData[key].dataSmall}`,
              jsonData[key].description);
            this.images.push(image);
          }
        );
      });
    } else { // if the searchString is empty, reload the whole gallery
      this.images = [];
      this.load();
    }
  }
  getImgIdx(id: string): number {
    for (let i = 0; i < this.images.length; i++) {
      if (id === this.images[i].id) {
        return i;
      }
    }
  }
  deinit(): void {
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
  }
}
