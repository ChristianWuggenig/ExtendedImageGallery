import { Component, OnInit, Input } from '@angular/core';
import {JsongalleryService} from '../jsongallery.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public galleryService: JsongalleryService,
              public authService: AuthService, private router: Router) {
  }

  ngOnInit() { // On (re)load, set navbar username depending on cookie (if logged-in)
    if (this.authService.isLoggedIn()) {
      this.authService.username = this.authService.getUsername();
    } else {
      this.authService.username = this.authService.config.standardUsername;
    }
  }

  logout(): void { // send logout request to server. Don't leave backdoor open :-)
    this.authService.logout().then((res) => {
      this.router.navigateByUrl(`/${this.authService.config.galleryRoute}`)
        .then((rerouting_res) => {
          this.authService.deleteCookie();
          this.authService.username = this.authService.config.standardUsername;
          this.authService.loggedIn = false;
          this.authService.loginMessage = '';
          this.authService.greeting = this.authService.config.standardGreeting;
          console.log('Rerouted after logout');
        }, (err) => {
          console.log('Failure rerouting after logout ', err);
        });
    }, (err) => {
      console.error('Logout error: ', err);
    });
    this.galleryService.deinit();
  };
}
