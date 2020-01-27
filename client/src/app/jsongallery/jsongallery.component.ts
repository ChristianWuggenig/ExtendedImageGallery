import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JsongalleryService } from '../jsongallery.service';
import { StarRatingComponent } from 'ng-starrating';
import {FavoritesService} from '../favorites.service';

@Component({
  selector: 'app-jsongallery',
  templateUrl: './jsongallery.component.html',
  styleUrls: ['./jsongallery.component.css']
})
export class JsongalleryComponent implements OnInit {
  bigImgId: string;
  bigImgSrc: string;
  desc: string;
  showBigImg = false;
  intervalID = null;
  private message: string;
  // tslint:disable-next-line:max-line-length
  constructor(private http: HttpClient, public galleryService: JsongalleryService, private cookie: CookieService, private favoritesService: FavoritesService) { }

  ngOnInit() {
    this.galleryService.load();
  }

  toggleBigImage(event: any, value: boolean): void {
    this.showBigImg = value;
    if (this.showBigImg) {
      this.bigImgSrc = event.target.dataset.large;
      this.bigImgId = event.target.dataset.dbid;
      this.desc = event.target.alt;
      this.galleryService.loadTag(Number(this.bigImgId));
    } else {
      clearTimeout(this.intervalID);
    }
  }
  getCurrentImgIdx(): number {
    for (let i = 0; i < this.galleryService.images.length; i++) {
      if (this.bigImgId === this.galleryService.images[i].id) {
        return i;
      }
    }
    return -1;
  }
  modulo(a: number, b: number): number {
    return ((a % b) + b) % b;
  }
  jump(value: number): void {
    let i = this.getCurrentImgIdx();
    if (i >= 0) {
      i = this.modulo(i + value, this.galleryService.images.length);
      const newImg = this.galleryService.images[i];
      this.bigImgSrc = newImg.data_big;
      this.desc = newImg.desc;
      this.bigImgId = newImg.id;
      this.galleryService.loadTag(Number(this.bigImgId));
    }
  }
  togglePlay(): void {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
    } else {
          this.intervalID = setInterval( () => this.jump(+1), 2000);
      }
  }
  updateDescription(): void {
    this.galleryService.updateDesc(this.bigImgId, this.desc);
  }
  onRate($event: {oldValue: number, newValue: number, starRating: StarRatingComponent}, image: number) {
    const image_id = image;
    const rating_id = $event.newValue;
    console.log(rating_id);
    const dataToAdd = {rating_id: rating_id, image_id: image_id};
    this.favoritesService.addRating(dataToAdd)
      .then((serverUploadResponse: HttpResponse<object>) => {
        console.log('Received server upload response: ', serverUploadResponse);
        this.setUserNotification('Upload successful');
      }, (serverUploadErrorResponse) => {
        console.log('Received server upload error response: ', serverUploadErrorResponse);
        this.setUserNotification('Upload error');
      })
      .catch((serverUploadErrorResponse: HttpErrorResponse) => {
        // tslint:disable-next-line:max-line-length
        console.error(`Server upload failed with response: `, serverUploadErrorResponse.status, serverUploadErrorResponse.statusText, ', ', serverUploadErrorResponse.error.message);
        if (serverUploadErrorResponse.status === 401) {
          this.setUserNotification(serverUploadErrorResponse.error.message);
        }
      });
  }
  getCurrentUser(): number {
    return 2;
  }

  uploadImage(currentImgIdx: number, currentUser: number): void {
    const image_id = currentImgIdx;
    const user_id = 2;
    const dataToAdd = {image_id: image_id, user_id: user_id};
    this.favoritesService.addToFavorites(dataToAdd)
      .then((serverUploadResponse: HttpResponse<object>) => {
        console.log('Received server upload response: ', serverUploadResponse);
        this.setUserNotification('Upload successful');
      }, (serverUploadErrorResponse) => {
        console.log('Received server upload error response: ', serverUploadErrorResponse);
        this.setUserNotification('Upload error');
      })
      .catch((serverUploadErrorResponse: HttpErrorResponse) => {
        // tslint:disable-next-line:max-line-length
        console.error(`Server upload failed with response: `, serverUploadErrorResponse.status, serverUploadErrorResponse.statusText, ', ', serverUploadErrorResponse.error.message);
        if (serverUploadErrorResponse.status === 401) {
           this.setUserNotification(serverUploadErrorResponse.error.message);
        }
      });
  }
  private setUserNotification(message: string): void {
    this.message = message;
    setTimeout(() => { this.message = null; }, 5000);
  }
}
