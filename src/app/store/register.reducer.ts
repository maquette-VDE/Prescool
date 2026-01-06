import { createReducer, on } from "@ngrx/store";
import { initialUserDataState } from './user.state';
import * as RegisterActions from './register.actions';

export const registerReducer = createReducer(
    initialUserDataState,

    on(RegisterActions.registerUser, (state, { nom, prenom, email, phone, password }) => ({
        ...state,
        nom, prenom, email, phone, password,
        step: 2,
    })),

    on(RegisterActions.actualRole, (state, { role }) => ({
        ...state,
        role,
    })),

    on(RegisterActions.registerConsultant, (state, { code, dateArrivee, euMission }) => ({
        ...state,
        code,
        dateArrivee,
        euMission,
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