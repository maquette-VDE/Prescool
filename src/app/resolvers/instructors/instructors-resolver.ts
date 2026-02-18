import { ResolveFn } from '@angular/router';
import { UserApiResponse } from '../../models/user-api.model';
import { inject } from '@angular/core';
import { UsersService } from '../../services/users/users-service';
import { UserRole } from '../../models/userRole';

export const instructorsResolver: ResolveFn<UserApiResponse> = (route, state) => {
  const usersService = inject(UsersService);
  const page = Number(route.queryParamMap.get('page')) || 0;
  const limit = Number(route.queryParamMap.get('limit')) || 10;
  const urlApi = `https://prez-cool-staging.appsolutions224.com/api/v1/users?role_names=${UserRole.INSTRUCTEUR}&limit=${limit}&page=${page}`;

  return usersService.getUsers(urlApi);
};
