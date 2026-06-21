import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AssignmentService } from '../services/assignment.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  trends: any[] = [];
  attendanceStats: any = null;
  studentsCount: number = 0;
  teachersCount: number = 0;
  maxRevenue: number = 1000;
  activityTrends: any[] = [];
  maxAdmissions: number = 10;
  maxInquiries: number = 10;
  maxAttendance: number = 100;
  userRole: string = 'Staff';
  myChildren: any[] = [];
  userName: string = 'Parent';

  // Parent Mock Data
  parentOverview = {
    activeAssignments: 3,
    assignmentsDueThisWeek: 2,
    todayAttendance: 'Present',
    checkInTime: '08:05 AM',
    weeklyAttendance: 95,
    monthlyAttendance: 92,
    unreadNotifications: 4
  };

  parentNotifications = [
    { title: 'Homework submission deadline extended.', time: '2 hours ago', read: false },
    { title: 'Parent-Teacher Meeting on 25 Feb.', time: '1 day ago', read: false },
    { title: 'School holiday announced for Friday.', time: '2 days ago', read: true },
    { title: 'Fee payment reminder.', time: '1 week ago', read: true }
  ];

  // Mock Data
  metrics = [
    { title: 'DASH_METRIC_STUDENTS', value: '...', change: 'Real-time', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { title: 'DASH_METRIC_STAFF', value: '...', change: 'Real-time', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'NAV_FEE_COLLECTION', value: '₹0', change: 'Real-time', icon: 'M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Pending Fees', value: '₹0', change: 'Real-time', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
  ];

  recentActivities: any[] = [];
  private activityInterval: any;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef, 
    private authService: AuthService,
    private assignmentService: AssignmentService
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || 'Staff';

    // If Parent, fetch linked children
    if (this.userRole === 'Parent') {
      this.userName = this.authService.getUserName() || 'Parent';
      
      this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students/MyChildren').subscribe({
        next: (childrenData) => {
          // Initialize children with mock attendance/notifications (assignments will be real)
          this.myChildren = childrenData.map(child => ({
            ...child,
            activeAssignments: 0, 
            todayAttendance: 'Not Marked', // Will be updated by attendance fetch
            weeklyAttendance: 95,
            monthlyAttendance: 92,
            lastNotification: 'No recent notifications',
            showDetails: false,
            weeklyDetails: [
              { date: 'Mon', status: 'Present' },
              { date: 'Tue', status: 'Present' },
              { date: 'Wed', status: 'Absent' },
              { date: 'Thu', status: 'Present' },
              { date: 'Fri', status: 'Present' }
            ],
            monthlyDetails: [
              { week: 'Week 1', present: 5, total: 5 },
              { week: 'Week 2', present: 4, total: 5 },
              { week: 'Week 3', present: 5, total: 5 },
              { week: 'Week 4', present: 3, total: 4 }
            ]
          }));

          // Now fetch real assignments
          this.assignmentService.getParentAssignments().subscribe({
            next: (assignments) => {
              // Calculate total active across all children
              const activeStatuses = ['Pending', 'Overdue'];
              const activeAssns = assignments.filter((a: any) => activeStatuses.includes(a.status));
              
              this.parentOverview.activeAssignments = activeAssns.length;
              
              // We could also calculate due this week if needed, but for now we'll leave it as a mock number or calculate it:
              const now = new Date();
              const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              this.parentOverview.assignmentsDueThisWeek = activeAssns.filter((a: any) => {
                const due = new Date(a.dueDate);
                return due >= now && due <= nextWeek;
              }).length;

              // Assign counts to individual children
              this.myChildren.forEach(child => {
                const childFullName = `${child.firstName} ${child.lastName}`.trim();
                child.activeAssignments = activeAssns.filter((a: any) => a.childName === childFullName).length;
              });

              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Failed to fetch parent assignments for dashboard', err);
            }
          });

          // Fetch real attendance
          this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Attendance/Parent/Today').subscribe({
            next: (attendances) => {
              let allPresent = true;
              let anyAbsent = false;
              let allNotMarked = true;

              this.myChildren.forEach(child => {
                const record = attendances.find(a => a.studentId === child.id);
                if (record) {
                  child.todayAttendance = record.status;
                  if (record.status !== 'Not Marked') {
                    allNotMarked = false;
                  }
                  if (record.status === 'Absent') {
                    allPresent = false;
                    anyAbsent = true;
                  } else if (record.status !== 'Present' && record.status !== 'Late') {
                    allPresent = false;
                  }
                }
              });

              if (allNotMarked) {
                this.parentOverview.todayAttendance = 'Not Marked';
              } else if (anyAbsent) {
                this.parentOverview.todayAttendance = 'Action Required';
              } else if (allPresent) {
                this.parentOverview.todayAttendance = 'Present';
              } else {
                this.parentOverview.todayAttendance = 'Mixed';
              }

              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Failed to fetch parent attendance for dashboard', err);
            }
          });

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to fetch children', err);
        }
      });
    }

    // Only fetch these metrics if the user is an Admin, Super Admin, School Admin, or Principal
    const adminRoles = ['Admin', 'Super Admin', 'School Admin', 'Principal'];
    if (!adminRoles.includes(this.userRole)) {
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

    // Fetch Activity Trends
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Dashboard/ActivityTrends').subscribe({
      next: (data) => {
        this.activityTrends = data;
        const maxAdm = Math.max(...data.map(d => d.admissions));
        const maxInq = Math.max(...data.map(d => d.inquiries));
        this.maxAdmissions = maxAdm > 0 ? maxAdm : 10;
        this.maxInquiries = maxInq > 0 ? maxInq : 10;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch activity trends', err);
      }
    });
  }

  ngOnDestroy() {
  }

}
