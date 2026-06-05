import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../services/project/project.service';
import { Project } from '../models/project';
import { UsersService } from '../services/users/users-service';
import { AuthService } from '../services/auth/auth.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projet-detail.html',
  styleUrl: './projet-detail.scss'
})
export class ProjetDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private userService = inject(UsersService);
  private authService = inject(AuthService);

  project = signal<any | null>(null);
  isLoading = signal<boolean>(true);
  team = signal<any | null>(null);
  members = signal<any[]>([]);
  isAdmin = signal<boolean>(false);
  allUsers: any[] = [];
  showModal = signal<boolean>(false);
  selectedUserId: number | null = null;
  searchTerm = signal<string>("");
  isEditingDescription = signal<boolean>(false);

 ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');

  this.authService.user$.subscribe(user => {
    console.log("USER COMPLET REÇU :", user);

   if (user) {
      const roles: string[] = user.roles || [];
      console.log("TABLEAU DES RÔLES REÇU :", roles);

      //  On vérifie si 'admin' ou 'instructor' est présent dans le tableau
      const hasPrivileges = roles.some(role =>
        role.toLowerCase() === 'admin' || role.toLowerCase() === 'instructor'
      );

      console.log("L'UTILISATEUR A LES DROITS ?", hasPrivileges);

      // On met à jour le signal
      this.isAdmin.set(hasPrivileges);
    }
  });

  if (id) {
    const numericId = Number(id);

  //  CHARGE TOUS LES USERS
    this.userService.getAllUsers().subscribe({
      next: (userRes) => {
        this.allUsers = userRes.items || [];

        console.log("ALL USERS LOADED:", this.allUsers.length);
        console.log("ALL USERS ARRAY:", this.allUsers);

        // charge le projet
        this.loadProjectData(id, numericId);
      },
      error: (err) => {
        console.error("Erreur chargement users :", err);
        this.loadProjectData(id, numericId);
      }

    });
  }
}

// Methode pour charger le projet

  loadProjectData(id: string, numericId: number) {
  this.projectService.getProjectById(id).subscribe({
    next: (p: any) => {

      console.log("PROJECT:", p);
      console.log("ALL USERS:", this.allUsers);

      // verifie si les utilisateurs sont bien chargés avant de faire le mapping

      if (!this.allUsers || this.allUsers.length === 0) {
        console.warn("allUsers est vide !");
      }

      const owner = this.allUsers.find(
        u => Number(u.id) === Number(p.created_by)
      );

      console.log("CREATED_BY:", p.created_by);
      console.log("OWNER FOUND:", owner);

      this.project.set({
        ...p,
        ownerFullname: owner
          ? `${owner.first_name} ${owner.last_name}`
          : `Utilisateur inconnu (#${p.created_by})`
      });

      this.loadProjectMembers(numericId);
      this.loadTeam(numericId);
      this.isLoading.set(false);
    },

    error: (err) => {
      console.error("Erreur projet :", err);
      this.isLoading.set(false);
    }
  });
}

// Methode pour charger les membres du projet et les enrichir avec les infos utilisateurs

  loadProjectMembers(projectId: number) {
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (resMembers) => {
        const allAssignments = resMembers.items ?? [];
        const validMembers = allAssignments.filter((m: any) => Number(m.project_id) === projectId);
        // Enrichir les membres avec les infos utilisateurs
        const enrichedMembers = validMembers.map((member: any) => {
          const u = this.allUsers.find(user => Number(user.id) === Number(member.user_id));
          return {
            ...member,
            displayName: u ? `${u.first_name} ${u.last_name}` : `Utilisateur #${member.user_id}`,
            email: u?.email || 'Email non trouvé',
            initials: u ? (u.first_name[0] + u.last_name[0]).toUpperCase() : 'U'
          };
        });

        this.members.set(enrichedMembers);
      },
      error: (err) => console.error("Erreur API membres :", err)
    });
  }

  // Methode pour charger la team du projet
  loadTeam(projectId: number) {
  this.projectService.getTeams().subscribe({
    next: (response) => {
      const allTeams = Array.isArray(response) ? response : response.items ?? [];
      const projectTeam = allTeams.find((t: any) => Number(t.project_id) === projectId);

      if (projectTeam) {
        this.team.set(projectTeam);
      }
    }
  });
}

 addMember() {
    console.log("Ouverture du formulaire d'ajout de membre...");
    this.showModal.set(true);
  }
  closeModal() {
    this.showModal.set(false);
    this.selectedUserId = null;
  }
confirmAddMember() {
  const projectData = this.project();
  const projectId = projectData?.id;

  // récupère l'utilisateur sélectionné
  const selectedUser = this.allUsers.find((u: any) => Number(u.id) === Number(this.selectedUserId));

  if (projectId && selectedUser && selectedUser.email) {
    this.projectService.addMemberToProject(Number(projectId), selectedUser.email)
      .subscribe({
        next: (response) => {
          console.log(" Membre ajouté avec succès :", response);
          this.loadProjectMembers(Number(projectId));

          this.closeModal();
          alert("Utilisateur ajouté au projet !");
        },
        error: (err: any) => {
          console.error(" Erreur lors de l'ajout :");
        }
      });
  } else {
    console.warn("Données manquantes pour l'envoi");
    alert(" Impossible de trouver l'utilisateur ou le projet.");
  }
}

// Méthode de recherche dans la liste des utilisateurs

get filteredUsers() {

  const term = this.searchTerm();


  if (!term || term.trim() === '') {
    return this.allUsers;
  }

  const search = term.toLowerCase();

  return this.allUsers.filter(u =>
    (u.first_name?.toLowerCase().includes(search)) ||
    (u.last_name?.toLowerCase().includes(search)) ||
    (u.email?.toLowerCase().includes(search))
  );
}

// methode pour sauvegarder la description modifiée en inline editing

saveInlineDescription(newDescription: string) {
  const projectId = this.project()?.id;
  if (!projectId) return;

  //  appelle DE la méthode de mise à jour le service existant
  this.projectService.updateProject(Number(projectId), { description: newDescription }).subscribe({
    next: (updatedProject) => {
      // Mettre à jour le signal local pour rafraîchir l'affichage
      this.project.set({
        ...this.project(),
        description: updatedProject.description
      });
      // Quitter le mode édition
      this.isEditingDescription.set(false);
    },
    error: (err) => {
      console.error("Erreur lors de la mise à jour de la description :", err);
      alert("Impossible de sauvegarder la description.");
    }
  });
}
}


