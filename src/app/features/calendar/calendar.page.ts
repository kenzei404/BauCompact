import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CalendarDatePipe,
  CalendarEvent,
  CalendarMonthViewComponent,
  CalendarNextViewDirective,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarView,
  CalendarWeekViewComponent,
  DateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models/task.model';
import { taskStatusLabel } from '../../shared/utils/status-label.util';

type CalendarMode = 'month' | 'week';

interface CalendarTaskItem extends Task {
  projectName: string;
}

interface CalendarTaskEventMeta {
  taskId: string;
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    CommonModule,
    CalendarDatePipe,
    CalendarMonthViewComponent,
    CalendarNextViewDirective,
    CalendarPreviousViewDirective,
    CalendarTodayDirective,
    CalendarWeekViewComponent,
  ],
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  templateUrl: './calendar.page.html',
  styleUrl: './calendar.page.scss',
})
export class CalendarPage {
  protected readonly CalendarView = CalendarView;

  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);

  protected readonly view = signal<CalendarMode>('month');
  protected readonly viewDate = signal(new Date());
  protected readonly selectedTaskId = signal<string | null>(null);
  protected readonly taskStatusLabel = taskStatusLabel;

  private readonly tasks = toSignal(this.taskService.getTasks(), { initialValue: [] });
  private readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });

  protected readonly calendarTasks = computed<CalendarTaskItem[]>(() =>
    this.tasks().map((task) => ({
      ...task,
      projectName:
        this.projects().find((project) => project.id === task.projectId)?.name ?? 'Unbekannt',
    })),
  );

  protected readonly monthEvents = computed<CalendarEvent<CalendarTaskEventMeta>[]>(() =>
    this.calendarTasks().map((task) => this.mapTaskToEvent(task, 'month')),
  );

  protected readonly weekEvents = computed<CalendarEvent<CalendarTaskEventMeta>[]>(() =>
    this.calendarTasks().map((task) => this.mapTaskToEvent(task, 'week')),
  );

  protected readonly selectedTask = computed(() => {
    const selectedTaskId = this.selectedTaskId();

    if (!selectedTaskId) {
      return null;
    }

    return this.calendarTasks().find((task) => task.id === selectedTaskId) ?? null;
  });

  protected setView(view: CalendarMode): void {
    this.view.set(view);
  }

  protected setViewDate(date: Date): void {
    this.viewDate.set(date);
  }

  protected selectEvent(event: CalendarEvent<CalendarTaskEventMeta>): void {
    this.selectedTaskId.set(event.meta?.taskId ?? null);
  }

  protected toneForStatus(status: TaskStatus): 'progress' | 'success' | 'warning' {
    if (status === 'done') {
      return 'success';
    }

    if (status === 'open') {
      return 'warning';
    }

    return 'progress';
  }

  protected currentEvents(): CalendarEvent<CalendarTaskEventMeta>[] {
    return this.view() === 'month' ? this.monthEvents() : this.weekEvents();
  }

  private mapTaskToEvent(
    task: CalendarTaskItem,
    mode: CalendarMode,
  ): CalendarEvent<CalendarTaskEventMeta> {
    const start = this.toEventStart(task.scheduledDate);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    const statusText = taskStatusLabel(task.status);
    const compactTitle = task.title;
    const detailedTitle =
      `${task.title} - ${task.projectName} - ${statusText} - ${task.description}`;

    return {
      start,
      end,
      title: mode === 'month' ? compactTitle : detailedTitle,
      color: this.colorForStatus(task.status),
      meta: {
        taskId: task.id,
      },
    };
  }

  private toEventStart(rawDate?: string): Date {
    const fallback = new Date();
    const value = rawDate ? new Date(`${rawDate}T09:00:00`) : fallback;

    return Number.isNaN(value.getTime()) ? fallback : value;
  }

  private colorForStatus(status: TaskStatus): { primary: string; secondary: string } {
    if (status === 'done') {
      return {
        primary: '#2f855a',
        secondary: '#e7f4ed',
      };
    }

    if (status === 'in_progress') {
      return {
        primary: '#2f6b45',
        secondary: '#edf4ef',
      };
    }

    return {
      primary: '#b7791f',
      secondary: '#fff4e5',
    };
  }
}
