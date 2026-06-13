import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './send-notification.component.html',
})
export class SendNotificationComponent implements OnInit {
  targetRole: string = 'Teacher';
  users: any[] = [];
  selectedUsers: Set<string> = new Set<string>();
  title: string = '';
  message: string = '';
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.users = [];
    this.selectedUsers.clear();
    this.notificationService.getUsersByRole(this.targetRole).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to fetch users', err)
    });
  }

  onRoleChange() {
    this.fetchUsers();
  }

  toggleUserSelection(userId: string) {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  selectAll() {
    this.users.forEach(u => this.selectedUsers.add(u.id));
  }

  deselectAll() {
    this.selectedUsers.clear();
  }

  sendNotification() {
    if (!this.title.trim() || !this.message.trim()) {
      this.errorMessage = 'Title and Message are required.';
      return;
    }
    if (this.selectedUsers.size === 0) {
      this.errorMessage = 'Please select at least one recipient.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      title: this.title,
      message: this.message,
      userIds: Array.from(this.selectedUsers)
    };

    this.notificationService.sendNotification(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Notification sent successfully!';
        this.title = '';
        this.message = '';
        this.selectedUsers.clear();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to send notification.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      }
    });
  }
}
