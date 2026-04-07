import { ResolveFn } from '@angular/router';
import { UsersApiResponse } from '../../interfaces/userItem';
import { inject } from '@angular/core';
import { UsersService } from '../../services/users/users-service';
import { UserRole } from '../../models/userRole';
import { map } from 'rxjs';

export const consultantResolver: ResolveFn<UsersApiResponse> = (
  route,
  state,
) => {
  const usersService = inject(UsersService);

  const status = route.queryParamMap.get('status') as
    | 'present'
    | 'absent'
    | 'late'
    | null;

  // Pagination normale
  let page = Number(route.queryParamMap.get('page')) || 0;
  let limit = Number(route.queryParamMap.get('limit')) || 10;

  if (status) {
    return usersService.getUsersByAttendanceStatus(status).pipe(
      map((response) => ({
        ...response,
        items: [...response.items].sort((a, b) =>
          usersService
            .normalize(a.first_name)
            .localeCompare(usersService.normalize(b.first_name), 'fr', {
              sensitivity: 'base',
            }),
        ),
      })),
    );
  }

  // CAS 2 : page consultant normale
  const urlApi =
    `https://prez-cool-staging.appsolutions224.com/api/v1/users` +
    `?role_names=${UserRole.CONSULTANT}` +
    `&role_names=${UserRole.ETUDIANT}` +
    `&limit=${limit}` +
    `&page=${page}`;

  return usersService.getUsers(urlApi).pipe(
    map((response) => ({
      ...response,
      items: [...response.items].sort((a, b) =>
        usersService
          .normalize(a.first_name)
          .localeCompare(usersService.normalize(b.first_name), 'fr', {
            sensitivity: 'base',
          }),
      ),
    })),
  );
};
