import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectResponse } from '../../models/project';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  // URLS
  private readonly API_URL = 'https://prez-cool-staging.appsolutions224.com/api/v1/projects';
  private readonly TEAMS_URL = 'https://prez-cool-staging.appsolutions224.com/api/v1/teams';
  private readonly ASSIGNMENTS_URL = 'https://prez-cool-staging.appsolutions224.com/api/v1/project-role-assignments';
 // private readonly TEAM_ASSIGNMENTS_URL = 'https://prez-cool-staging.appsolutions224.com/api/v1/team-role-assignments';

  /**
   * Récupère la liste des projets avec pagination
   */
  getProjects(page: number = 0, limit: number = 10, email?: string): Observable<ProjectResponse> {
   let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())

      if (email) {
    params = params.set('user_emails', email);
  }

    return this.http.get<ProjectResponse>(this.API_URL, { params });
  }


  // Récupère un projet par son ID

getProjectById(id: number | string): Observable<Project> {
  return this.http.get<Project>(`${this.API_URL}/${id}`);
}

  /**
   * Crée un nouveau projet
   */
  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.API_URL, project);
  }

  // Récupérer les teams filtrées par projet
getTeamById(teamId: number | string): Observable<any> {
 return this.http.get<any>(`${this.TEAMS_URL}/${teamId}`);
}
 // Récupérer toutes les teams
getTeams(): Observable<any> {
    return this.http.get<any>(this.TEAMS_URL);
  }

 // Récupérer les membres d'un projet

getProjectMembers(projectId: number): Observable<any> {
  return this.http.get<any>(`${this.ASSIGNMENTS_URL}?project_id=${projectId}&limit=100`);
}

addMemberToProject(projectId: number, email: string): Observable<any> {
  const payload = {
    role_name: "student",
    project_id: Number(projectId),
    user_email: email,
    status: "active"
  };
  return this.http.post(this.ASSIGNMENTS_URL, payload);
}
}
