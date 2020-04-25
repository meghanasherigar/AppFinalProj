import { Directive, ElementRef, HostListener, Input } from '@angular/core';
// import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[alphabetsonly]'
})
export class Alphabetdirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/[^a-zA-Z\s]*/g, '');
    if ( initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}