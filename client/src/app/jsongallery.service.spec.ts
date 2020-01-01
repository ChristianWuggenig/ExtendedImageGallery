import { TestBed } from '@angular/core/testing';

import { JsongalleryService } from './jsongallery.service';

describe('JsongalleryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: JsongalleryService = TestBed.get(JsongalleryService);
    expect(service).toBeTruthy();
  });
});
