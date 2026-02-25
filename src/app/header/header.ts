import { Component, inject, OnInit, HostListener, computed, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/planning/user.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { NgTemplateOutlet } from '@angular/common';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, NgTemplateOutlet,],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
  
  // N'oublie pas d'ajouter les styles ici ou dans un fichier .css
})
export class HeaderComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  public imagePreview: string | ArrayBuffer | null = null;
  readonly searchQuery = signal<string>('');
  readonly profiles = signal<DayPilot.ResourceData[]>([]);

  user: any = null;
  isMenuOpen = false;
  isUpdating = false;
  showSuccess = false;
  showError = false;
  public visibleCreate = false;
  Linkroute: string = '';
  public currentUser: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    is_superuser: true,
  };


currentTitle: string = 'Chargement...';
currentSubtitle: string = ''; // Nouvelle variable pour le sous-titre

ngOnInit() {
    // 1. Charger l'utilisateur
    this.userService.getUserMe().subscribe({
      next: (data) => {
        this.currentUser = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur header:', err)
    });

    // 2. Fonction de mise à jour (Titre + Route actuelle)
    const updateData = (route: ActivatedRoute) => {
      let activeRoute = route;
      while (activeRoute.firstChild) {
        activeRoute = activeRoute.firstChild;
      }
      
      const data = activeRoute.snapshot.data;
      this.currentTitle = data['title'] || 'Application';
      this.currentSubtitle = data['subtitle'] || '';

      // Mise à jour de Linkroute pour ton @if du HTML
      // On récupère le dernier segment de l'URL
      this.Linkroute = this.router.url.split('/').pop() || '';
      
      this.cdr.detectChanges();
    };

    // 3. Appels initiaux et écouteur
    updateData(this.activatedRoute);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      updateData(this.activatedRoute);
    });
  }

  
  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(
      (p) =>
        p['name']?.toLowerCase().includes(query) ||
        p['tags']['code']?.toLowerCase().includes(query)
    );
  });


  private refreshData(): void {
    const resources = this.filteredProfiles().map((p) => ({
      id: p['id'],
      name: p['name'],
      tags: p['tags'],
    }));}

  get userInitials(): string {
    const f = this.currentUser?.first_name?.charAt(0) || '';
    const l = this.currentUser?.last_name?.charAt(0) || '';
    return (f + l).toUpperCase() || '??';
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.user-pill')) {
      this.isMenuOpen = false;
    }
  }

  saveProfile() {
    this.isUpdating = true;
    const profileData = {
      first_name: this.currentUser.first_name,
      last_name: this.currentUser.last_name,
      email: this.currentUser.email,
      phone_number: this.currentUser.phone_number || '',
      is_active: true,
    };

    this.userService.updateUserMe(profileData).subscribe({
      next: (res: any) => {
        this.isUpdating = false;
        this.showSuccess = true;
        this.closeWithDelay();
      },
      error: (err: any) => {
        this.isUpdating = false;
        this.showError = true;
        this.closeWithDelay();
      },
    });
  }

  private closeWithDelay() {
    setTimeout(() => {
      this.visibleCreate = false;
      this.showSuccess = false;
      this.showError = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  toggleCreateModal() {
    this.visibleCreate = !this.visibleCreate;

    if (!this.visibleCreate) {
      this.imagePreview = null;
    }
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.refreshData();
  }

  hasRole(roleName: string): boolean {
  if (!this.user || !this.user.roles) return false;
  return this.user.roles.some((r: string) => 
    r.toLowerCase() === roleName.toLowerCase()
  );
}
}