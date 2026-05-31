import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

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
  
  constructor(private router: Router, private http: HttpClient) {}

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
    }
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

  logout() {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}
