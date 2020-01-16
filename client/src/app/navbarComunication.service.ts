import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class NavbarComunicationService {
  public inputEvents: EventEmitter<string> = new EventEmitter();

  public inputChanged(newValue: string) {
    this.inputEvents.emit(newValue);
  }
}
