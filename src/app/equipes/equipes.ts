import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../services/project/project.service';
import { Project } from '../models/project';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './equipes.html',
  styleUrl: './equipes.scss',
})
export class Equipes implements OnInit {
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);


  projectsList = signal<Project[]>([]);
  isLoading = signal<boolean>(false);
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('TOUS');
  selectedOwner = signal<string>('TOUS');
  isStatusMenuOpen = signal<boolean>(false);
  isOwnerMenuOpen = signal<boolean>(false);
  currentProjectId: number | null = null;


  projectForm: FormGroup;
  private modalInstance: any;

  constructor() {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['EN ATTENTE', Validators.required],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.loadProjects();
  }
  toggleStatusMenu() {
  this.isOwnerMenuOpen.set(false);
  this.isStatusMenuOpen.update(v => !v);
}

toggleOwnerMenu() {
  this.isStatusMenuOpen.set(false);
  this.isOwnerMenuOpen.update(v => !v);
}


  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

filteredProjects = computed(() => {
  const query = this.searchQuery().toLowerCase().trim();
  const statusFilter = this.selectedStatus().toLowerCase();
  const ownerFilter = this.selectedOwner().toLowerCase();

  return this.projectsList().filter(p => {
    // Filtre Recherche
    const matchesSearch = p.name.toLowerCase().includes(query);

    // Filtre Statut
    const projectStatus = p.status ? p.status.toLowerCase() : '';
    const matchesStatus = statusFilter === 'tous' || projectStatus === statusFilter;
    // Filtre Propriétaire
    const matchesOwner = ownerFilter === 'tous' || ownerFilter === 'moi';

    return matchesSearch && matchesStatus && matchesOwner;
  });
});

 setStatusFilter(status: string) {
  this.selectedStatus.set(status);
  this.isStatusMenuOpen.set(false);
}
setOwnerFilter(owner: string) {
  this.selectedOwner.set(owner);
  this.isOwnerMenuOpen.set(false);

  let emailToFilter: string | undefined = undefined;

  if (owner === 'moi') {
    // récupère l'utilisateur depuis la valeur actuelle du subject du service

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    emailToFilter = currentUser?.email;

    console.log("Filtrage pour :", emailToFilter);
  }

  this.loadProjects(emailToFilter);
}

loadProjects(email?: string) {
  this.isLoading.set(true);
  this.projectService.getProjects(0, 100, email).subscribe({
    next: (response) => {
      const items = Array.isArray(response) ? response : response.items ?? [];
      this.projectsList.set(items);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Erreur chargement projets', err);
      this.isLoading.set(false);
    }
  });
}

 openCreateModal() {
    this.currentProjectId = null; //  pour repasser en mode création
    this.projectForm.reset({ status: 'EN ATTENTE', is_active: true, description: '' });

    const modalElement = document.getElementById('createProjectModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement);
      this.modalInstance.show();
    }
  }

openEditModal(project: Project) {
    this.currentProjectId = project.id;

    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      is_active: project.is_active
    });

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
          this.projectForm.reset({ status: 'EN ATTENTE', is_active: true,description: '' });

          if (this.modalInstance) {
            this.modalInstance.hide();
          }
        },
        error: (err) => console.error('Erreur création', err)
      });
    }
  }

  // mettre a jour un projet

  updateExistingProject(projectId: number) {
    if (this.projectForm.valid) {
      const updatedData: Partial<Project> = this.projectForm.value;

      this.projectService.updateProject(projectId, updatedData).subscribe({
        next: (updatedProject: Project) => {
          console.log('Projet mis à jour avec succès :', updatedProject);

          this.projectsList.update((currentList: Project[]) =>
            currentList.map(p => p.id === projectId ? updatedProject : p)
          );

          this.projectForm.reset({ status: 'EN ATTENTE', is_active: true, description: '' });
          this.currentProjectId = null;

          if (this.modalInstance) {
            this.modalInstance.hide();
          }

          alert("Le projet a bien été modifié !");
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour :', err);
          alert("Une erreur est survenue lors de la modification.");
        }
      });
    } else {
      console.warn("Formulaire invalide");
    }
  }

  // Supprimer un projet

  deleteExistingProject(projectId: number, projectName: string) {

  if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectName}" ?`)) {

    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
        console.log(`Projet ${projectId} supprimé avec succès`);

        //   On met à jour le Signal en filtrant la liste pour exclure le projet supprimé

        this.projectsList.update((currentList: Project[]) =>
          currentList.filter(p => p.id !== projectId)
        );

        alert("Le projet a bien été supprimé !");
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert("Une erreur est survenue lors de la suppression du projet.");
      }
    });
  }
}
}




