import { createAction, props } from '@ngrx/store';
import { UserRole } from '../models/userRole';

export const registerUser = createAction(
  '[Register] Register User step 1',
  props<{  
      email: string;
      last_name: string;
      first_name: string; 
      phone?: string;
      password: string;
 }>()
);

export const actualRole = createAction(
  '[Register] Set Actual Role',
  props<{ role: UserRole }>()
);

export const registerConsultant = createAction(
  '[Register] Register User step 2 Consultant',
  props<{ code: string; arrivedAt: Date; gotMission:boolean }>()
);

export const registerExpert = createAction(
  '[Register] Register User step 2 Expert',
  props<{ diplome: string }>()
);

export const goToStep = createAction(
  '[Register] Go To Step',
  props<{ step: number }>()
);

export const registerSuccess = createAction(
  '[Register] Register Success',
  props<{ userData: any }>()
);

export const registerFailure = createAction(
  '[Register] Register Failure',
  props<{ error: any }>()
);