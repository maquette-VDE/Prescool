import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UsersApiResponse, UserItem } from '../interfaces/userItem';
import { UserEvent } from '../interfaces/events';
import { RouterPagination } from '../shared/base/router-pagination.abstract';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [],
  templateUrl: './instructor.html',
  styleUrl: './instructor.scss',
})
export class Instructor extends RouterPagination<UsersApiResponse, UserItem> {
  private instructorsRouteData = toSignal(this.route.data);

  protected override routeDataSignal = computed(
    () => this.instructorsRouteData()?.['instructors'] as UsersApiResponse,
  );

  protected override allItems = computed(
    () => this.routeDataSignal()?.items ?? []
  );

  protected override activeFilters = signal<string[]>([]);

  protected override filterFn = (
    _item: UserItem,
    _filters: string[],
    _eventsMap: Map<number, UserEvent>
  ): boolean => true;

  hoveredInstructorId = signal<number | null>(null);
}