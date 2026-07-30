import { Directive } from '@angular/core';

@Directive({
  selector: 'input[type=checkbox][appCheckbox]',
  host: {
    class: 'app-checkbox',
  },
})
export class AppCheckbox {}
