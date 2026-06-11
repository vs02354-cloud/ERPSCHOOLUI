import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: []
})
export class DashboardLayoutComponent implements OnInit {
  userName: string = 'Admin User';
  userRole: string = 'Super Admin';
  showProfileModal: boolean = false;
  userProfile: any = null;
  isMobileMenuOpen: boolean = false;
  showLogoutModal: boolean = false;
  showNotificationDropdown: boolean = false;
  notifications: Notification[] = [];
  unreadCount: number = 0;
  
  constructor(private router: Router, private http: HttpClient, private notificationService: NotificationService) {
    this.router.events.subscribe(() => {
      this.showNotificationDropdown = false;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }


  ngOnInit() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const firstName = payload['FirstName'];
        const lastName = payload['LastName'];
        
        if (firstName || lastName) {
          this.userName = `${firstName || ''} ${lastName || ''}`.trim();
        } else {
          this.userName = payload['unique_name'] || 'User';
        }
        
        const rawRole = payload['UserType'] || 'Staff';
        this.userRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
        // Exception for Super/School Admin if it was passed weirdly
        if (rawRole.toLowerCase() === 'super admin') this.userRole = 'Super Admin';
        if (rawRole.toLowerCase() === 'school admin') this.userRole = 'School Admin';
      } catch (e) {
        console.error('Error decoding token', e);
      }
      
      this.fetchNotifications();
    }
  }

  fetchNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      },
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  toggleNotifications() {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  markNotificationAsRead(notif: Notification) {
    if (notif.isRead) return;
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    });
  }

  openProfile() {
    this.http.get('https://erpschoolapi.onrender.com/api/Auth/profile').subscribe({
      next: (data) => {
        this.userProfile = data;
        this.showProfileModal = true;
      },
      error: (err) => console.error('Failed to fetch profile', err)
    });
  }

  closeProfile() {
    this.showProfileModal = false;
  }

  confirmLogout() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  logout() {
    this.showLogoutModal = false;
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}
