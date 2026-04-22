import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../services/project/project.service';
import { Project } from '../models/project';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipes.html',
  styleUrl: './equipes.scss',
})
export class Equipes implements OnInit {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);


  projectsList = signal<Project[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');

  filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.projectsList();

    return this.projectsList().filter(p =>
      p.name.toLowerCase().includes(query)
    );
  });

  projectForm: FormGroup;
  private modalInstance: any;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      status: ['EN ATTENTE', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading.set(true);
    // la limite de la lise a 100
    this.projectService.getProjects(0, 100).subscribe({
      next: (response) => {
        this.projectsList.set(response.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement projets', err);
        this.isLoading.set(false);
      }
    });
  }

  // Méthode appelée par l'event (input) de la barre de recherche
  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  openCreateModal() {
    const modalElement = document.getElementById('createProjectModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

  saveProject() {
    if (this.projectForm.valid) {
      this.projectService.createProject(this.projectForm.value).subscribe({
        next: (newProject) => {

          this.projectsList.update(current => [newProject, ...current]);
          this.projectForm.reset({ status: 'EN ATTENTE', is_active: true });

          if (this.modalInstance) {
            this.modalInstance.hide();
          }
        },
        error: (err) => console.error('Erreur création', err)
      });
    }
  }
}
