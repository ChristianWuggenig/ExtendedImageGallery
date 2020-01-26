import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { JsongalleryService } from '../jsongallery.service';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.css']
})
export class MyaccountComponent implements OnInit {

  firstname: string;
  lastname: string;
  password: string;
  dataForm: FormGroup;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.dataForm = new FormGroup({
      'firstname': new FormControl(this.firstname, [
        Validators.required
      ]),
      'lastname': new FormControl(this.lastname, [
        Validators.required
      ]),
      'password': new FormControl(this.password, [
        Validators.required,
        Validators.minLength(4)
      ])
    });
    this.getData();
  }
  getData(): void {
    const dataUrl = `http://${this.authService.config.serverHost}:${this.authService.config.serverPort}/${this.authService.config.updateRoute}`;
    this.authService.getData(dataUrl)
      .then((serverDataResponse: any) => {
        this.dataForm.controls['firstname'].setValue(serverDataResponse.first_name);
        this.dataForm.controls['lastname'].setValue(serverDataResponse.last_name);
        this.dataForm.controls['password'].setValue(serverDataResponse.password);
      })
      .catch((serverErrorResponse: HttpErrorResponse) => {
        console.error(`Server login failed with response: `, serverErrorResponse.status, serverErrorResponse.statusText, ', ', serverErrorResponse.error.message);
        if (serverErrorResponse.status === 401) {
          this.dataForm.controls['firstname'].setErrors({invalid: true});
          this.dataForm.controls['lastname'].setErrors({invalid: true});
          this.dataForm.controls['password'].setErrors({invalid: true});
          setTimeout(() => { this.dataForm.reset(); }, 5000);
        }
      });
  }
  updateData(): void {
    console.log('updateData');
    if (!this.isValidInput()) { return; }
    const updateUrl = `
    http://${this.authService.config.serverHost}:${this.authService.config.serverPort}/${this.authService.config.updateRoute}`;

    console.log(updateUrl);

    const data = {firstName: this.firstname, lastName: this.lastname, password: this.password};
    this.authService.updateData(updateUrl, data)
      .then((serverUpdateResponse: any) => {
        this.authService.greeting = `Hello ${this.firstname}`;
        this.authService.username = this.firstname;

        console.log('serverUpdateResponse: ', serverUpdateResponse);
        console.log('response.message', serverUpdateResponse.message);
        console.log(serverUpdateResponse.token);

//        this.authService.createCookie(serverUpdateResponse);
//        this.dataForm.reset();

      })
      .catch((serverLoginError: HttpErrorResponse) => {
        console.error(`Server data update failed with response: `, serverLoginError.status, serverLoginError.statusText, ', ', serverLoginError.error.message);
        if (serverLoginError.status === 401) {
          this.dataForm.controls['password'].setErrors({invalid: true});
          this.dataForm.controls['firstname'].setErrors({invalid: true});
          this.dataForm.controls['lastname'].setErrors({invalid: true});
          setTimeout(() => { this.dataForm.reset(); }, 5000);
        }
      });
  }

  isValidInput(): Boolean {
    if (this.dataForm.valid) {
      this.firstname = this.dataForm.get('firstname').value;
      this.lastname = this.dataForm.get('lastname').value;
      this.password = this.dataForm.get('password').value;
      return true;
    }
    return false;
  }
}
