import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit {
  trends: any[] = [];
  maxRevenue: number = 1000;
  userRole: string = 'Staff';

  // Mock Data
  metrics = [
    { title: 'Total Students', value: '...', change: 'Real-time', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { title: 'Total Teachers', value: '...', change: 'Real-time', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'Fee Collection', value: '$45,231', change: '+8%', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Pending Fees', value: '$12,050', change: '-5%', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
  ];

  recentActivities = [
    { text: 'New student John Doe admitted to Grade 5.', time: '2 mins ago' },
    { text: 'Fee payment of $500 received from Jane Smith.', time: '1 hour ago' },
    { text: 'Teacher Sarah published Math assignment.', time: '3 hours ago' },
    { text: 'Library book "Physics 101" returned late.', time: '5 hours ago' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || 'Staff';

    // If teacher, don't fetch these counts or trends
    if (this.userRole === 'Teacher') {
      return;
    }

    // Fetch Total Students
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students').subscribe({
      next: (students) => {
        this.metrics[0].value = students.length.toString();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch students count', err);
        this.metrics[0].value = 'Error';
        this.cdr.detectChanges();
      }
    });

    // Fetch Total Teachers
    this.http.get<any>('https://erpschoolapi.onrender.com/api/HR/Employees?pageSize=1&searchTerm=Teacher').subscribe({
      next: (response) => {
        // The API returns a PaginatedResponse with a totalCount property
        this.metrics[1].value = response.totalCount ? response.totalCount.toString() : '0';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch teachers count', err);
        this.metrics[1].value = 'Error';
        this.cdr.detectChanges();
      }
    });

    // Fetch Real-time Fee Collection & Pending Fees
    this.http.get<any>('https://erpschoolapi.onrender.com/api/Fees/DashboardStats').subscribe({
      next: (stats) => {
        // Format to Indian Rupee
        const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
        
        this.metrics[2].value = formatCurrency(stats.totalCollection || 0);
        this.metrics[2].change = 'Real-time';
        
        this.metrics[3].value = formatCurrency(stats.pendingFees || 0);
        this.metrics[3].change = 'Real-time';
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch fee stats', err);
        this.metrics[2].value = 'Error';
        this.metrics[3].value = 'Error';
        this.cdr.detectChanges();
      }
    });

    // Fetch Trends
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Fees/Trends').subscribe({
      next: (data) => {
        this.trends = data;
        const maxRev = Math.max(...data.map(d => d.revenue));
        this.maxRevenue = maxRev > 0 ? maxRev : 1000;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch trends', err);
      }
    });
  }
}
