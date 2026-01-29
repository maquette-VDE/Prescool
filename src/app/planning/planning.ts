import { Component, ViewChild, AfterViewInit, signal, inject, OnInit, OnDestroy, computed, ChangeDetectorRef } from '@angular/core';
import { DayPilot, DayPilotModule, DayPilotSchedulerComponent } from '@daypilot/daypilot-lite-angular';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PlanningService } from '../services/planning/planning-service';
import { SchedulerUtils } from './scheduler-utils';
import { PlanningData } from '../resolvers/planning/planning-resolver';
import { ModalModule, ButtonModule, FormModule } from '@coreui/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/planning/user.service';
import Swal from 'sweetalert2';
import { DropdownModule } from '@coreui/angular';
import * as bootstrap from 'bootstrap';


@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    DayPilotModule,
    FormsModule,
    ButtonModule,
    ModalModule,
    ButtonModule, 
    
  ],
  templateUrl: './planning.html',
  styleUrls: ['./planning.css'],
  
})
export class Planning implements AfterViewInit, OnDestroy {
  
  private readonly route = inject(ActivatedRoute);
  private readonly planningService = inject(PlanningService);
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);
  

  readonly profiles = signal<DayPilot.ResourceData[]>([]);
  readonly searchQuery = signal<string>('');
  readonly today = new DayPilot.Date();

  readonly filteredProfiles = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.profiles().filter(p =>
      p['name']?.toLowerCase().includes(query) ||
      p['tags']['code']?.toLowerCase().includes(query)
    );
  });

  @ViewChild('scheduler') scheduler!: DayPilotSchedulerComponent;

  config = signal<DayPilot.SchedulerConfig>({
    timeHeaders : [
      { groupBy: 'Day', format: 'dddd d'},
    ],
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
      this.profiles.set(data.resources);
      this.scheduler.control.update({
        resources: data.resources,
        events: data.events
      });

      if (data.events.length > 0) {
        this.scheduler.control.scrollTo(data.events[0].start);
      }
  }

  ngAfterViewChecked() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');

    tooltipTriggerList.forEach(tooltipTriggerEl => {
      if (!bootstrap.Tooltip.getInstance(tooltipTriggerEl)) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      }
    });
  }

  changeWeek(step: number): void {
    this.config.update(prev => ({
      ...prev,
      startDate: new DayPilot.Date(prev.startDate).addDays(step * 7).firstDayOfWeek(1)
    }));
    this.refreshData();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.refreshData();
  }

  private refreshData(): void {
    const resources = this.filteredProfiles().map(p => ({
      id: p['id'],
      name: p['name'],
      tags: p['tags']
    }));

    this.planningService.getUsersDayPilotData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.scheduler.control.update({
        resources: resources,
        events: data.events
      });
    });
  }


// ----------------User Courant -------------//

public currentUser: any = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    is_active: true,
    is_superuser: true
  };

constructor(private userService: UserService) {}
  // 2. ÉTAPE A : On charge les données au démarrage
  ngOnInit() {
    this.userService.getUserMe().subscribe({
      next: (data) => {
        this.currentUser = data;
      },
      
      error: (err) => console.error('Erreur chargement', err)
    });
    console.log("je charge les data");
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


  saveProfile() {
  const profileData = {
    first_name: this.currentUser.first_name,
    last_name: this.currentUser.last_name,
    email: this.currentUser.email,
    phone_number: this.currentUser.phone_number || "",
    is_active: true // Très important si le schéma l'exige
  };

  this.userService.updateUserMe(profileData).subscribe({
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


  get weekRangeLabel(): string {
    const start = new DayPilot.Date(this.config().startDate);
    const end = start.addDays(4);
    return `${start.toString('d MMM', 'fr-fr')} - ${end.toString('d MMM', 'fr-fr')}`;
  }
  // --- Méthodes de la Modal ---
  toggleCreateModal() {
    console.log("je suis dans toggle");
    // On bascule l'affichage
    this.visibleCreate = !this.visibleCreate;

    // Si on ferme la modal, on peut réinitialiser l'aperçu
    if (!this.visibleCreate) {
        this.imagePreview = null;
    }
}

 onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = () => this.imagePreview = reader.result;
        reader.readAsDataURL(input.files[0]);
    }
}

}
