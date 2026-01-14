import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-validate-users',
  imports: [],
  templateUrl: './validate-users.html',
  styleUrl: './validate-users.css',
})
export class ValidateUsers {
validateUser(_t13: any) {
throw new Error('Method not implemented.');
}
rejectUser(_t13: any) {
throw new Error('Method not implemented.');
}
toConsultant() {
throw new Error('Method not implemented.');
}
toExpert() {
throw new Error('Method not implemented.');
}
  constructor(
    private route: Router
  ) {}

  ngOnInit() {}

  back(){
    this.route.navigateByUrl('');
  }
}
