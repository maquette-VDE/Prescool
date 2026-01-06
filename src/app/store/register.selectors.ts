import { UserDataState } from './user.state';
import { createFeatureSelector, createSelector } from '@ngrx/store';


export const selectUserDataState =
  createFeatureSelector<UserDataState>('userData');

export const selectStep1User = createSelector(
  selectUserDataState,
  (state) => ({ 
                nom: state.nom, 
                prenom: state.prenom, 
                phone: state.phone, 
                email: state.email, 
                password: state.password 
            })
);

export const selectStep2Consultant = createSelector(
  selectUserDataState,
  (state) => ({ 
                code: state.code,
                dateArrivee: state.dateArrivee,
                euMission: state.euMission
            })
);

export const selectStep2Expert = createSelector(
  selectUserDataState,
  (state) => ({ 
                diplome: state.diplome
            })
);

export const selectRole = createSelector(
  selectUserDataState,
  (state) => state.role
);

export const selectCurrentStep = createSelector(
  selectUserDataState,
  (state) => state.step
);
