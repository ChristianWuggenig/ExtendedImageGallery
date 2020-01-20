import {Component, OnInit} from '@angular/core';
import {ImageuploadService} from '../imageupload.service';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-imageupload',
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.css']
})
export class ImageuploadComponent implements OnInit {

  private selectedFile: File;
  private message: string;

  constructor(private imageuploadService: ImageuploadService) {
  }

  ngOnInit() { }

  onUpload(input: HTMLInputElement): void {
    const file = input.files[0];
    if (file) {
      const dataToSend = {data: file};
      this.imageuploadService.upload(dataToSend)
        .then((serverUploadResponse: HttpResponse<object>) => {
          console.log('Received server upload response: ', serverUploadResponse);
        }, (serverUploadErrorResponse) => {
          console.log('Received server upload error response: ', serverUploadErrorResponse);
        });
    }

    // Todo: log responses to user
  }
}
