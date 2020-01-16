import { Component, OnInit, Input } from '@angular/core';
import {JsongalleryService} from '../jsongallery.service';
import {NavbarComunicationService} from '../navbarComunication.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input('navbar_username') private username: string;
  private subscription: Subscription;

  constructor(public galleryService: JsongalleryService,
              public navbarComunicationService: NavbarComunicationService,
              public authService: AuthService,
              public cookie: CookieService) {
    this.subscription = this.navbarComunicationService.inputEvents.subscribe((newValue) => {
      this.username = newValue;
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.username = 'Test'; // this.authService.username;
    } else {
      this.username = 'Guest'; // this.authService.config.standardUsername;
    }
  }

  logout(): void {
    this.authService.deleteCookie();
    this.username = this.authService.config.standardUsername;
    this.authService.loggedIn = false;
    this.authService.loginMessage = '';
    this.authService.greeting = this.authService.config.standardGreeting;
    // this.galleryService.deinit();
  }
}
