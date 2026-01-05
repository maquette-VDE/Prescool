import { createReducer, on } from "@ngrx/store";
import { initialUserDataState } from './user.state';
import * as RegisterActions from './register.actions';

export const registerReducer = createReducer(
    initialUserDataState,

    on(RegisterActions.registerUser, (state, { id='', nom, prenom, email, phone }) => ({
        ...state,
        id, nom, prenom, email, phone,
        step: 2,
    })),

    on(RegisterActions.actualRole, (state, { role }) => ({
        ...state,
        role,
    })),

    on(RegisterActions.registerConsultant, (state, { code, dateArrivee }) => ({
        ...state,
        code,
        dateArrivee,
        step: 3,
    })),

    on(RegisterActions.registerExpert, (state, { diplome }) => ({
        ...state,
        diplome,
        step: 3,
    })),

    on(RegisterActions.goToStep, (state, { step }) => ({
        ...state,
        step,
    })),
);