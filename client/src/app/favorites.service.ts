import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private config = {
    serverHost: 'localhost',
    serverPort: 3000,
    galleryRoute: 'gallery',
    favoriteRoute: 'favorites',
    imageRoute: 'image',
    ratingRoute: 'rating'
  };

  constructor(private http: HttpClient) {}

  addToFavorites(dataToBeAdded: {image_id: number}) {
    // tslint:disable-next-line:max-line-length
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.favoriteRoute}:id=${dataToBeAdded.image_id}`;
    return new Promise((resolve, reject) => {
      this.http.post(serveruploadurl,  {}) // httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  removeFromFavorites(dataToRemoved: {image_id: number}) {
    // tslint:disable-next-line:max-line-length
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.favoriteRoute}:image_id=${dataToRemoved.image_id}`;
    return new Promise((resolve, reject) => {
      this.http.delete(serveruploadurl) // httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  addRating(rating: { rating_id: number; image_id: number }) {
    // tslint:disable-next-line:max-line-length
      const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.ratingRoute}:image_id=${rating.image_id}/:rating_id=${rating.rating_id}`;
      return new Promise((resolve, reject) => {
        this.http.post(serveruploadurl, {}) // httpOptions || {})
          .subscribe(
            response => resolve(response),
            err => reject(err)
          );
      });
  }
}
