import {
  Component,
  ViewChild,
  AfterViewInit,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DayPilot,
  DayPilotModule,
  DayPilotSchedulerComponent,
} from '@daypilot/daypilot-lite-angular';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlanningService } from '../services/planning/planning-service';
import { SchedulerUtils } from './scheduler-utils';
import { PlanningData } from '../resolvers/planning/planning-resolver';
import { HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/planning/user.service';

import * as bootstrap from 'bootstrap';
import { Speciality } from '../interfaces/speciality';

export enum events_status {
  present = 'Present(e)',
  absent = 'Absent(e)',
  excused = 'Excusé(e)',
  late = 'En retard',
  mission = 'En mission',
  remote = 'En télétravail',
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, DayPilotModule, FormsModule],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
})
export class Planning implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  private isViewInitialized = false;
  public isMenuOpen = false;
  readonly profiles = signal<DayPilot.ResourceData[]>([]);
  readonly searchQuery = signal<string>('');
  readonly today = new DayPilot.Date();
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(1);
  selectedStatus = signal<string>('');
  selectedSpecialty = signal<string>('');
  EVENT_STATUS = events_status;
  statusList = Object.entries(this.EVENT_STATUS);

  readonly specialties = signal<Speciality[]>([]);
  selectedSpecialties = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);

  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(
      (p) =>
        p['name']?.toLowerCase().includes(query) ||
        p['tags']['code']?.toLowerCase().includes(query),
    );
  });

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders: [{ groupBy: 'Day', format: 'dddd d' }],
    headerHeight: 60,
    locale: 'fr-fr',
    scale: 'Day',
    startDate: DayPilot.Date.today().firstDayOfWeek(1),
    days: 5,
    rowHeaderWidth: 200,
    eventHeight: 80,
    cellWidth: 155,
    theme: 'rounded',
    onBeforeEventRender: (args) => SchedulerUtils.renderEvent(args),
    onBeforeRowHeaderRender: (args) => SchedulerUtils.renderResource(args),
  });

  translateDateToFr(date: DayPilot.Date, format: string): string {
    return date.toString(format, 'fr-fr');
  }

  ngAfterViewInit(): void {
    const data = this.route.snapshot.data['planningData'];
    this.totalPages.set(data.pagination.pages);
    this.specialties.set(data.specialties);
    this.profiles.set(data.resources);
    this.scheduler.control.update({
      resources: data.resources,
      events: data.events,
    });

    if (data.events.length > 0) {
      this.scheduler.control.scrollTo(data.events[0].start);
    }
    this.isViewInitialized = true;
  }

  ngAfterViewChecked() {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );

    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      if (!bootstrap.Tooltip.getInstance(tooltipTriggerEl)) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // Si on clique en dehors de la zone qui contient la classe .user-pill
    if (!event.target.closest('.user-pill')) {
      this.isMenuOpen = false;
    }
  }

  changeWeek(step: number): void {
    this.config.update((prev) => ({
      ...prev,
      startDate: new DayPilot.Date(prev.startDate)
        .addDays(step * 7)
        .firstDayOfWeek(1),
    }));
    this.refreshData();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.refreshData();
  }

  private refreshData(): void {
    if (!this.isViewInitialized) return;
    if (!this.scheduler || !this.scheduler.control) {
      console.warn("Le scheduler n'est pas encore prêt.");
      return;
    }

    let startDate = this.config().startDate as DayPilot.Date;
    const endDate = startDate?.addDays(4);

    this.planningService
      .getUsersDayPilotData(
        this.currentPage(),
        10,
        startDate.toString(),
        endDate.toString(),
        this.searchQuery(),
        this.selectedStatus(),
        this.selectedSpecialty(),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.specialties.set(data.specialties);
        this.totalPages.set(data.pagination.pages);
        if(this.totalPages() !== 0) {
        this.scheduler.control.update({
          resources: data.resources,
          events: data.events,
        });}
      });
  }

  toggleSpecialty(code: string): void {
    const current = this.selectedSpecialties();
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];

    this.selectedSpecialties.set(next);
    this.currentPage.set(0);
    this.refreshData();
  }

  toggleStatus(status: string): void {
    const current = this.selectedStatuses();
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];

    this.selectedStatuses.set(next);
    this.currentPage.set(0);
    this.refreshData();
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.refreshData();
    }
  }
  // ----------------User Courant -------------//

  public currentUser: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    is_superuser: true,
  };

  constructor(private userService: UserService) {}
  // 2. ÉTAPE A : On charge les données au démarrage
  ngOnInit() {
    this.userService.getUserMe().subscribe({
      next: (data) => {
        this.currentUser = data;
      },

      error: (err) => console.error('Erreur chargement', err),
    });
    console.log('je charge les data');
  }

  // TODO à ajouter la photo de profile dans le backend
  /*saveProfile(fileInput: HTMLInputElement) {
    const formData = new FormData();
    const fileToUpload = fileInput.files?.[0];

    // On ajoute l'image si elle existe
    if (fileToUpload) {
      formData.append('profile_picture', fileToUpload);
    }

    // On utilise this.currentUser qui contient ce que l'utilisateur a tapé
    formData.append('first_name', this.currentUser.first_name || '');
    formData.append('last_name', this.currentUser.last_name || '');
    formData.append('email', this.currentUser.email || '');
    formData.append('phone_number', this.currentUser.phone_number || '');

    if (this.currentUser.password) {
      formData.append('password', this.currentUser.password);
    }

    // On envoie seulement l'update
     this.userService.updateUserMe(formData).subscribe({
    next: (res: any) => {
      console.log('Réponse du serveur :', res);

      Swal.fire({
        title: 'Profil Mis à Jour !',
        text: 'Vos modifications ont été enregistrées avec succès.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        position: 'center',
        didOpen: () => {
          const container = Swal.getContainer();
          if (container) container.style.zIndex = '9999';
        },
      });

      this.visibleCreate = false;
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Erreur serveur :', err);
      Swal.fire(
        'Erreur',
        "Le serveur n'a pas pu mettre à jour votre profil. Vérifiez votre connexion.",
        'error'
      );
    },
  });
  }*/

  public toastMessage: string = '';
  public toastType: 'success' | 'error' = 'success';
  public showToast: boolean = false;

  isUpdating: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  saveProfile() {
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

  // Fonction utilitaire pour éviter de répéter le setTimeout
  private handleModalClosure() {
    setTimeout(() => {
      this.visibleCreate = false;
      this.showSuccess = false;
      this.showError = false; // On reset l'erreur
      this.cdr.detectChanges();
    }, 1500);
  }

  //-----------les initiales------------------//

  get userInitials(): string {
    const p = this.currentUser?.first_name || '';
    return (p.charAt(0) + p.charAt(1)).toUpperCase() || '??';
  }

  //------------------------------------------------//

  // --- Logique de la Modal de Profil ---
  public visibleCreate = false;
  public imagePreview: string | ArrayBuffer | null = null;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  onEventStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.currentPage.set(0);
    this.refreshData();
  }

  onSpecialtyChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedSpecialty.set(value);
    console.log('Selected specialty:', value);
    this.currentPage.set(0);
    this.refreshData();
  }
  get weekRangeLabel(): string {
    const start = new DayPilot.Date(this.config().startDate);
    const end = start.addDays(4);
    return `${start.toString('d MMM', 'fr-fr')} - ${end.toString(
      'd MMM',
      'fr-fr',
    )}`;
  }
  // --- Méthodes de la Modal ---
  toggleCreateModal() {
    this.visibleCreate = !this.visibleCreate;

    if (!this.visibleCreate) {
      this.imagePreview = null;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(input.files[0]);
    }
  }
}
