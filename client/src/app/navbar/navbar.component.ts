import { Component, OnInit, Input } from '@angular/core';
import {JsongalleryService} from '../jsongallery.service';
import {NavbarComunicationService} from '../navbarComunication.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input('navbar_username') private username: string;
  private subscription: Subscription;

  constructor(public galleryService: JsongalleryService, public navbarComunicationService: NavbarComunicationService) {
    this.subscription = this.navbarComunicationService.inputEvents.subscribe((newValue) => {
      this.username = newValue;
    });
  }

  ngOnInit() {
    this.username = 'Guest';
  }

}
