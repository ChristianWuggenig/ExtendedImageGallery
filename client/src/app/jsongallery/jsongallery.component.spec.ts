import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsongalleryComponent } from './jsongallery.component';

describe('JsongalleryComponent', () => {
  let component: JsongalleryComponent;
  let fixture: ComponentFixture<JsongalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsongalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsongalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
