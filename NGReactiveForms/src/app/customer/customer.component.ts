import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms'
import { Customer } from './customer'

function emailMatcher(c: AbstractControl) {
  const emailControl = c.get('email');
  const confirmEmailControl = c.get('confirmEmail');
  if (emailControl.value === confirmEmailControl.value) {
    return null;
  }
  return { 'match': true }
}

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value != undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
      return { 'range': true }
    }
    return null
  }
}

@Component({
  selector: 'my-signup',
  templateUrl: './customer.component.html'
})
export class CustomerComponent implements OnInit {

  customerForm: FormGroup
  customer: Customer = new Customer()
  emailMessage: string

  private validationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email address.'
  }

  get addresses(): FormArray{
    return <FormArray>this.customerForm.get('addresses')
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
        confirmEmail: ['', Validators.required]
      }, { validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: ['', ratingRange(1, 5)],
      sendCatalog: true,
      addresses: this.fb.array([this.buildAddress()])
    })

    this.customerForm.get('notification').valueChanges.subscribe(value => this.sendNotification(value))
    const emailControl = this.customerForm.get('emailGroup.email')
    emailControl.valueChanges.subscribe(value => this.setMessage(emailControl))

    // debounceTime(1000) is not working
    // this.customerForm = new FormGroup({
    //   firstName: new FormControl(),
    //   lastName: new FormControl(),
    //   email: new FormControl(),
    //   sendCatalog: new FormControl(true)
    // });
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  sendNotification(notify: string) {
    const phoneControl = this.customerForm.get('phone');
    if (notify === 'text') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    })
  }
  setMessage(c: AbstractControl): void {
    this.emailMessage = ''
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ')
    }
  }

  addAddress(): void{
    this.addresses.push(this.buildAddress())
  }
}
