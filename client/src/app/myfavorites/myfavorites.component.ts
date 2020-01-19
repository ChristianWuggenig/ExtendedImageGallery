import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { JsongalleryService } from '../jsongallery.service';
import { StarRatingComponent } from 'ng-starrating';

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
  constructor(private http: HttpClient, public galleryService: JsongalleryService, private cookie: CookieService) {
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
  updateDescription(): void {
    this.galleryService.updateDesc(this.bigImgId, this.desc);
  }
  onRate($event: {oldValue: number, newValue: number, starRating: StarRatingComponent}) {
    /*alert(`Old Value:${$event.oldValue},
    New Value: ${$event.newValue},
    Checked Color: ${$event.starRating.checkedcolor},
    Unchecked Color: ${$event.starRating.uncheckedcolor}`); */
  }
}

