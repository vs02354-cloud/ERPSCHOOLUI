import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { FlatpickrModule } from 'angularx-flatpickr';

interface AttendanceReport {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  attendancePercentage: number;
  records: any[];
}

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrModule],
  templateUrl: './attendance-report.html',
  styleUrls: []
})
export class AttendanceReportComponent implements OnInit {
  selectedDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = new Date().toISOString().split('T')[0];
  selectedClass: string = '';
  selectedSection: string = '';
  
  classes: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  sections: string[] = ['A', 'B', 'C', 'D'];

  report: AttendanceReport | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, public authService: AuthService) {}

  ngOnInit() {}

  generateReport() {
    if (!this.selectedClass || !this.selectedSection || !this.selectedDate) {
      this.errorMessage = 'Please select Date, Class, and Section.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.report = null;
    this.cdr.detectChanges();

    const url = `https://erpschoolapi.onrender.com/api/Attendance/Report?date=${this.selectedDate}&className=${this.selectedClass}&section=${this.selectedSection}`;
    
    this.http.get<AttendanceReport>(url).subscribe({
      next: (data) => {
        this.report = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching report', err);
        this.errorMessage = 'Failed to generate report.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  printReport() {
    window.print();
  }
}
