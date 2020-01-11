import { Component, OnInit } from '@angular/core';
import {JsongalleryService} from '../jsongallery.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private username: string;

  constructor(public galleryService: JsongalleryService) { }

  ngOnInit() {
    this.username = 'Guest';
  }

}
