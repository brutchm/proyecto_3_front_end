import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  debounceTime,
  fromEvent,
  takeUntil,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private unsubscriber: Subject<any> = new Subject();
  private pageTitle = new BehaviorSubject<string>('');

  public title = this.pageTitle.asObservable();
  public sidebarOpen: boolean = true;

  constructor() {
  }

  public setTitle(title: string) {
    this.pageTitle.next(title);
  }

  ngOnDestroy(): void {
    this.unsubscriber.complete();
  }

  public toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
