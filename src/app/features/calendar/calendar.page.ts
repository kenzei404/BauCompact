import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CalendarDatePipe,
  CalendarEvent,
  CalendarNextViewDirective,
  CalendarPreviousViewDirective,
  CalendarTodayDirective,
  CalendarWeekViewComponent,
  DateAdapter,
  provideCalendar,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { taskStatusLabel } from '../../shared/utils/status-label.util';

type CalendarMode = 'month' | 'week';

interface CalendarTaskItem extends Task {
  projectName: string;
  scheduledDate: string;
  priority: TaskPriority;
}

interface CalendarTaskEventMeta {
  taskId: string;
  title: string;
  description: string;
  projectName: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate: string;
}

interface CalendarMonthDay {
  date: Date;
  inMonth: boolean;
  tasks: CalendarTaskItem[];
}

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [
    CommonModule,
    CalendarDatePipe,
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
export class CalendarPage implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly projectService = inject(ProjectService);

  protected readonly view = signal<CalendarMode>('month');
  protected readonly viewDate = signal(new Date());
  protected readonly selectedTaskId = signal<string | null>(null);
  protected readonly taskStatusLabel = taskStatusLabel;

  private readonly tasks = toSignal(this.taskService.getTasks(), { initialValue: [] });
  private readonly projects = toSignal(this.projectService.getProjects(), { initialValue: [] });

  protected readonly calendarTasks = computed<CalendarTaskItem[]>(() => {
    const projects = this.projects();

    return this.tasks()
      .map((task) => ({
        ...task,
        scheduledDate: task.scheduledDate ?? new Date().toISOString().slice(0, 10),
        priority: task.priority ?? 'medium',
        projectName: projects.find((project) => project.id === task.projectId)?.name ?? 'Unbekannt',
      }))
      .sort((left, right) => this.compareTasks(left, right));
  });

  protected readonly weekEvents = computed<CalendarEvent<CalendarTaskEventMeta>[]>(() =>
    this.calendarTasks().map((task) => this.mapTaskToEvent(task)),
  );

  protected readonly selectedTask = computed(() => {
    const selectedTaskId = this.selectedTaskId();

    if (!selectedTaskId) {
      return null;
    }

    return this.calendarTasks().find((task) => task.id === selectedTaskId) ?? null;
  });
  protected readonly monthWeeks = computed<CalendarMonthDay[][]>(() => {
    const currentDate = this.viewDate();
    const tasks = this.calendarTasks();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const weeks: CalendarMonthDay[][] = [];

    let cursor = gridStart;

    while (cursor <= gridEnd) {
      const week: CalendarMonthDay[] = [];

      for (let index = 0; index < 7; index += 1) {
        const dayDate = addDays(cursor, index);
        const isoDate = dayDate.toISOString().slice(0, 10);

        week.push({
          date: dayDate,
          inMonth: isSameMonth(dayDate, currentDate),
          tasks: tasks.filter((task) => task.scheduledDate === isoDate),
        });
      }

      weeks.push(week);
      cursor = addDays(cursor, 7);
    }

    return weeks;
  });

  ngOnInit(): void {
    this.view.set('month');
  }

  protected setView(view: CalendarMode): void {
    this.view.set(view);
  }

  protected setViewDate(date: Date): void {
    this.viewDate.set(date);
  }

  protected selectEvent(event: CalendarEvent<CalendarTaskEventMeta>): void {
    this.selectedTaskId.set(event.meta?.taskId ?? null);
  }

  protected selectTask(taskId: string, domEvent?: Event): void {
    domEvent?.stopPropagation();
    this.selectedTaskId.set(taskId);
  }

  protected markEventAsDone(calendarEvent: CalendarEvent<CalendarTaskEventMeta>, domEvent: Event): void {
    domEvent.stopPropagation();
    this.markTaskAsDone(calendarEvent.meta?.taskId ?? '');
  }

  protected markTaskAsDone(taskId: string, domEvent?: Event): void {
    domEvent?.stopPropagation();

    const task = this.calendarTasks().find((item) => item.id === taskId);

    if (!task || task.status === 'done') {
      return;
    }

    this.taskService.updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      status: 'done',
      projectId: task.projectId,
      assignedRole: task.assignedRole,
      scheduledDate: task.scheduledDate,
      priority: task.priority,
    });
  }

  protected monthStatusCount(day: CalendarMonthDay, status: TaskStatus): number {
    return day.tasks.filter((task) => task.status === status).length;
  }

  protected hasStatus(day: CalendarMonthDay, status: TaskStatus): boolean {
    return this.monthStatusCount(day, status) > 0;
  }

  private mapTaskToEvent(task: CalendarTaskItem): CalendarEvent<CalendarTaskEventMeta> {
    const start = this.toEventStart(task.scheduledDate);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    const statusText = taskStatusLabel(task.status);
    const detailedTitle = `${task.title} - ${task.projectName} - ${statusText} - ${task.description}`;

    return {
      start,
      end,
      title: detailedTitle,
      color: this.colorForStatus(task.status),
      meta: {
        taskId: task.id,
        title: task.title,
        description: task.description,
        projectName: task.projectName,
        status: task.status,
        priority: task.priority,
        scheduledDate: task.scheduledDate,
      },
    };
  }

  private toEventStart(rawDate: string): Date {
    const value = new Date(`${rawDate}T09:00:00`);
    return Number.isNaN(value.getTime()) ? new Date() : value;
  }

  private colorForStatus(status: TaskStatus): { primary: string; secondary: string } {
    if (status === 'done') {
      return { primary: '#2f855a', secondary: '#e7f4ed' };
    }

    if (status === 'in_progress') {
      return { primary: '#2f6b45', secondary: '#edf4ef' };
    }

    return { primary: '#b7791f', secondary: '#fff4e5' };
  }

  private compareTasks(left: CalendarTaskItem, right: CalendarTaskItem): number {
    return this.compareTaskValues(
      left.status,
      left.scheduledDate,
      left.priority,
      left.title,
      right.status,
      right.scheduledDate,
      right.priority,
      right.title,
    );
  }

  private compareTaskValues(
    leftStatus: TaskStatus,
    leftDate: string,
    leftPriority: TaskPriority,
    leftTitle: string,
    rightStatus: TaskStatus,
    rightDate: string,
    rightPriority: TaskPriority,
    rightTitle: string,
  ): number {
    const statusOrder: Record<TaskStatus, number> = {
      open: 0,
      in_progress: 1,
      done: 2,
    };
    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };

    return (
      statusOrder[leftStatus] - statusOrder[rightStatus] ||
      leftDate.localeCompare(rightDate) ||
      priorityOrder[leftPriority] - priorityOrder[rightPriority] ||
      leftTitle.localeCompare(rightTitle)
    );
  }
}
