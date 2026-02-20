import { ResolveFn } from '@angular/router';
import { UserApiResponse } from '../../models/user-api.model';
import { inject } from '@angular/core';
import { UsersService } from '../../services/users/users-service';
import { UserRole } from '../../models/userRole';
import { map } from 'rxjs';

export const instructorsResolver: ResolveFn<UserApiResponse> = (route, state) => {
  const usersService = inject(UsersService);
  const page = Number(route.queryParamMap.get('page')) || 0;
  const limit = Number(route.queryParamMap.get('limit')) || 10;
  const urlApi = `https://prez-cool-staging.appsolutions224.com/api/v1/users?role_names=${UserRole.INSTRUCTEUR}&limit=${limit}&page=${page}`;
  const collator = new Intl.Collator('fr', {
    sensitivity: 'base',
    ignorePunctuation: true,
  });

  return usersService.getUsers(urlApi).pipe(
    map((response) =>
      ({
      ...response,
      items: [...response.items].sort((a, b) =>
        collator.compare(
          usersService.normalize(a.last_name),
          usersService.normalize(b.last_name)
        ),
      ),
    })),
  );
};
