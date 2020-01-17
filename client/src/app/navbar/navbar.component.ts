import { Component, OnInit, Input } from '@angular/core';
import {JsongalleryService} from '../jsongallery.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public galleryService: JsongalleryService,
              public authService: AuthService) {
  }

  ngOnInit() { // On (re)load, set navbar username depending on cookie (if logged-in)
    if (this.authService.isLoggedIn()) {
      this.authService.username = this.authService.getUsername();
    } else {
      this.authService.username = this.authService.config.standardUsername;
    }
  }

  logout(): void {
    this.authService.deleteCookie();
    this.authService.username = this.authService.config.standardUsername;
    this.authService.loggedIn = false;
    this.authService.loginMessage = '';
    this.authService.greeting = this.authService.config.standardGreeting;
    this.galleryService.deinit();
  }
}
