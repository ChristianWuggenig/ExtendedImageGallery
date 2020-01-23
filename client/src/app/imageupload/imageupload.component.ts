import {Component, OnInit} from '@angular/core';
import {ImageuploadService} from '../imageupload.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-imageupload',
  templateUrl: './imageupload.component.html',
  styleUrls: ['./imageupload.component.css']
})
export class ImageuploadComponent implements OnInit {

  private file: File;
  private fileName: string;
  private message: string;
  private uploadForm: FormGroup;
  private description: string;

  constructor(private imageuploadService: ImageuploadService) {
  }

  ngOnInit() {
    this.uploadForm = new FormGroup({
      'input': new FormControl(this.file, [Validators.required]),
      'description': new FormControl(this.description, [Validators.required])
    });
  }

  onUpload(input: HTMLInputElement, input_description: HTMLInputElement): void {
    const file = input.files[0];
    this.description = input_description.value;
    console.log(this.description);
    if (file) {
      const dataToSend = {data: file, description: this.description};
      this.imageuploadService.upload(dataToSend)
        .then((serverUploadResponse: HttpResponse<object>) => {
          console.log('Received server upload response: ', serverUploadResponse);
          this.setUserNotification('Upload successful');
          setTimeout(() => { this.message = null; this.uploadForm.reset(); }, 5000);
        }, (serverUploadErrorResponse) => {
          console.log('Received server upload error response: ', serverUploadErrorResponse);
          this.setUserNotification('Upload error');
        })
        .catch((serverUploadErrorResponse: HttpErrorResponse) => {
          console.error(`Server upload failed with response: `, serverUploadErrorResponse.status, serverUploadErrorResponse.statusText, ', ', serverUploadErrorResponse.error.message);
          if (serverUploadErrorResponse.status === 401) {
            this.setUserNotification(serverUploadErrorResponse.error.message);
          }
        });
    }
  }
  onSelectionChange(evt): void {
    this.fileName = evt.target.files[0].name;
  }

  private setUserNotification(message: string): void {
    this.message = message;
    setTimeout(() => { this.message = null; this.fileName = null; this.file = null; this.uploadForm.reset(); }, 5000);
  }
}
