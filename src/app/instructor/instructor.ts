import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersApiResponse } from '../interfaces/userItem';
import { RouterPagination } from '../shared/base/router-pagination.abstract';

@Component({
  selector: 'app-instructor',
  imports: [],
  templateUrl: './instructor.html',
  styleUrl: './instructor.scss',
})
export class Instructor extends RouterPagination<UsersApiResponse> {
  private instructorsRouteData = toSignal(this.route.data);

  protected override routeDataSignal = computed(
    () => this.instructorsRouteData()?.['instructors'] as UsersApiResponse,
  );

  //Signaux dérivés
  instructors = computed(() => this.routeDataSignal()?.items ?? []);
  hoveredInstructorId = signal<number | null>(null);
}
