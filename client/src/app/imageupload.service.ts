import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

//const httpOptions = {
  // headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data' })
//};

@Injectable({
  providedIn: 'root'
})
export class ImageuploadService {

  private config = {
      serverHost: 'localhost',
      serverPort: 3000,
      galleryRoute: 'gallery',
      uploadRoute: 'upload',
      imageRoute: 'image'
    };

  constructor( private http: HttpClient ) { }

  upload(dataToBeUploaded: { data: File, description: string, tags: string }) {
    const serveruploadurl = `http://${this.config.serverHost}:${this.config.serverPort}/${this.config.imageRoute}/`
    + `${this.config.uploadRoute}`;
    const formdata = new FormData();
    formdata.append('description', dataToBeUploaded.description);
    formdata.append('image', dataToBeUploaded.data, dataToBeUploaded.data.name);
    formdata.append('tags', dataToBeUploaded.tags)
    console.log('File image: ', dataToBeUploaded.data);
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
