import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectResponse } from '../../models/project';
import { environment } from '../../../environments/environment'; // Adapte le chemin selon ton projet

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  
  // URL
  private readonly API_URL = 'https://prez-cool-staging.appsolutions224.com/api/v1/projects';

  /**
   * Récupère la liste des projets avec pagination
   */
  getProjects(page: number = 0, limit: number = 10): Observable<ProjectResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ProjectResponse>(this.API_URL, { params });
  }

  /**
   * Crée un nouveau projet
   */
  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.API_URL, project);
  }
}
