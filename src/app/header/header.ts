import {
  Component,
  inject,
  OnInit,
  HostListener,
  computed,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/planning/user.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],

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
  private authService = inject(AuthService);

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

  public oldPassword: string = ''; // Pour vérifier l'ancien
  public newPassword: string = ''; // Pour stocker le nouveau
  public confirmPassword: string = '';
  private fb = inject(FormBuilder);
  public userForm!: FormGroup;
  public errorMessage: string = '';

  ngOnInit() {
    // 1. Charger l'utilisateur

    this.userService.getUserMe().subscribe({
      next: (data) => {
        this.currentUser = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur header:', err),
    });

    // 1. Initialiser la structure vide
    this.userForm = this.fb.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone_number: [''],
        //oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.minLength(8)]],
        confirmPassword: [''],
      },
      { validators: this.passwordMatchValidator },
    );

    this.userService.getUserMe().subscribe({
      next: (data) => {
        this.currentUser = data;
        // On injecte les données dans le formulaire
        this.userForm.patchValue({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
        });
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur header:', err),
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

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        updateData(this.activatedRoute);
      });
  }

  // Validateur pour comparer les deux mots de passe
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  // Pour savoir si on affiche une erreur dans le HTML
  hasError(field: string, error: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.touched && control.hasError(error));
  }

  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(
      (p) =>
        p['name']?.toLowerCase().includes(query) ||
        p['tags']['code']?.toLowerCase().includes(query),
    );
  });

  private refreshData(): void {
    const resources = this.filteredProfiles().map((p) => ({
      id: p['id'],
      name: p['name'],
      tags: p['tags'],
    }));
  }

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
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Force l'affichage des erreurs rouges
      return;
    }

    const val = this.userForm.value;
    this.isUpdating = true;
    this.errorMessage = '';

    // ÉTAPE 1 : On vérifie l'ancien mot de passe via le Login
    this.authService.login(this.currentUser.email, val.oldPassword).subscribe({
      next: () => {
        // ÉTAPE 2 : Si OK, on lance la mise à jour avec les données du formulaire
        this.procederAMiseAJour(val);
      },
      error: (err: any) => {
        this.isUpdating = false;
        this.errorMessage = "L'ancien mot de passe est incorrect.";
      },
    });
  }

  private procederAMiseAJour(formData: any) {
    const profileData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number || '',
      is_active: this.currentUser.is_active ?? true,
    };

    // On ajoute le password seulement s'il a été saisi
    if (formData.newPassword && formData.newPassword.trim() !== '') {
      profileData.password = formData.newPassword;
    }

    this.userService.updateUserMe(profileData).subscribe({
      next: (res: any) => {
        this.isUpdating = false;
        this.showSuccess = true;
        this.userForm.reset(); // On vide tout
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
    return this.user.roles.some(
      (r: string) => r.toLowerCase() === roleName.toLowerCase(),
    );
  }
}
