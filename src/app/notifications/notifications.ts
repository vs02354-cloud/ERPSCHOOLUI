import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.html',
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  isLoading: boolean = true;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.isLoading = true;
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(notif: Notification) {
    if (notif.isRead) return;
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
      this.cdr.detectChanges();
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.cdr.detectChanges();
    });
  }
}
