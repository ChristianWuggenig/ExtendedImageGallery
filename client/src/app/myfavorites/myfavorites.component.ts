import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JsongalleryService } from '../jsongallery.service';
import {FavoritesService} from '../favorites.service';
import {StarRatingComponent} from 'ng-starrating';

@Component({
  selector: 'app-myfavorites',
  templateUrl: './myfavorites.component.html',
  styleUrls: ['./myfavorites.component.css']
})
export class MyfavoritesComponent implements OnInit {

  bigImgId: string;
  bigImgSrc: string;
  desc: string;
  showBigImg = false;
  intervalID = null;
  private message: string;
  constructor(private http: HttpClient, public galleryService: JsongalleryService, private cookie: CookieService,
              private favoritesService: FavoritesService) {
  }
  ngOnInit() {
    this.galleryService.loadFavorites();
  }
  toggleBigImage(event: any, value: boolean): void {
    this.showBigImg = value;
    if (this.showBigImg) {
      this.bigImgSrc = event.target.dataset.large;
      this.bigImgId = event.target.dataset.dbid;
      this.desc = event.target.alt;
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
  removeImage(currentImgIdx: number): void {
    const image_id = currentImgIdx;
    const dataToRemove = {image_id: image_id};
    this.favoritesService.removeFromFavorites(dataToRemove)
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
  onRate($event: {oldValue: number, newValue: number, starRating: StarRatingComponent}) {
    /*alert(`Old Value:${$event.oldValue},
    New Value: ${$event.newValue},
    Checked Color: ${$event.starRating.checkedcolor},
    Unchecked Color: ${$event.starRating.uncheckedcolor}`); */
  }
}

