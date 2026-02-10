import { ResolveFn } from '@angular/router';
import { UsersApiResponse } from '../../interfaces/userItem';
import { inject } from '@angular/core';
import { ConsultantService } from '../../services/consultant/consultant-service';

export const consultantResolver: ResolveFn<UsersApiResponse> = (route, state) => {
  const consultantService = inject(ConsultantService);
  const page = Number(route.queryParamMap.get('page')) || 0;
  const limit = Number(route.queryParamMap.get('limit')) || 10;
  return consultantService.getConsultants(page, limit);
};
