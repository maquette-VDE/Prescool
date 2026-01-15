import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { UsersService } from '../services/admin/users.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-validate-users',
  imports: [],
  templateUrl: './validate-users.html',
  styleUrl: './validate-users.css',
})
export class ValidateUsers {
  constructor(
    private route: Router,
    private usersService: UsersService,
  ) {}

  userList: Observable<any> = new Observable<any>();
  users: User[] = [];

  ngOnInit() {
    this.userList = this.usersService.getListOfPendingUsers();
    console.log(this.userList);
    //je dois recuperer la liste des users en attente de validation
    //il faut get/users/ et filtrer sur is_active=false
    //ensuite get/users/{id} pour recuperer les infos de chaque user
    //et un get/role/{email} pour recuperer le role de chaque user

  }
  back(){
    this.route.navigateByUrl('');
  }


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
}
