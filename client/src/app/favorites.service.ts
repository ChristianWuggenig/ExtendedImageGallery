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

  addToFavorites(dataToBeAdded: {user_id: number, image_id: number}) {
    // tslint:disable-next-line:max-line-length
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.favoriteRoute}:id=${dataToBeAdded.image_id}/:user_id=${dataToBeAdded.user_id}`;
    const formData: FormData = new FormData();
    formData.append('user_id', dataToBeAdded.user_id.toString());
    formData.append('image_id', dataToBeAdded.image_id.toString());
    console.log('This is created formdata');
    console.log(formData.get('user_id'));
    console.log(formData.get('image_id'));

    return new Promise((resolve, reject) => {
      this.http.post(serveruploadurl, formData, {}) // httpOptions || {})
        .subscribe(
          response => resolve(response),
          err => reject(err)
        );
    });
  }

  removeFromFavorites(dataToRemoved: {image_id: number, user_id: number}) {
    // tslint:disable-next-line:max-line-length
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.favoriteRoute}:image_id=${dataToRemoved.image_id}/:user_id=${dataToRemoved.user_id}`;

    const formdata = new FormData();
    formdata.append('image_id', dataToRemoved.image_id.toString());
    console.log('Current image: ', dataToRemoved.image_id);
    console.log('This is created formdata');
    console.log(formdata);
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
      const formdata = new FormData();
      formdata.append('image', rating.image_id.toString());
      console.log(formdata);

      return new Promise((resolve, reject) => {
        this.http.post(serveruploadurl, formdata, {}) // httpOptions || {})
          .subscribe(
            response => resolve(response),
            err => reject(err)
          );
      });
  }
}
