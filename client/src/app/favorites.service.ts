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
    imageRoute: 'image'
  };

  constructor(private http: HttpClient) {
  }
  addToFavorites(dataToBeAdded: {user_id: number, image_id: number}) {
    // tslint:disable-next-line:max-line-length
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/${this.config.favoriteRoute}`;
    const formdata = new FormData();
    formdata.append('user_id', dataToBeAdded.user_id.toString());
    formdata.append('image_id', dataToBeAdded.image_id.toString());
    console.log('Current user: ', dataToBeAdded.user_id);
    console.log('Current image: ', dataToBeAdded.image_id);
    console.log('This is created formdata');
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
