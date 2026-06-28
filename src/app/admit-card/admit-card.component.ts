import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-admit-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './admit-card.component.html',
  styleUrls: []
})
export class AdmitCardComponent implements OnInit {
  classes: string[] = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  selectedClass: string = '';
  
  students: any[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isIssuing = false;

  selectAll = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
  }

  loadStudents() {
    if (!this.selectedClass) {
      this.errorMessage = 'Please select a class first.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectAll = false;

    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students').subscribe({
      next: (data) => {
        // Filter students by selected class and where IsAdmitCardIssued is false or not set
        this.students = data.filter(s => s.currentClass === this.selectedClass && !s.isAdmitCardIssued).map(s => ({
          ...s,
          selected: false
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.errorMessage = 'Failed to load students. Please check your connection.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSelectAll() {
    this.students.forEach(s => s.selected = this.selectAll);
  }

  checkIfAllSelected() {
    this.selectAll = this.students.every(s => s.selected);
  }

  issueAdmitCards() {
    const selectedStudentIds = this.students.filter(s => s.selected).map(s => s.id);
    
    if (selectedStudentIds.length === 0) {
      this.errorMessage = 'Please select at least one student to issue an admit card.';
      return;
    }

    this.isIssuing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post('https://erpschoolapi.onrender.com/api/Students/IssueAdmitCards', selectedStudentIds).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Admit cards issued successfully.';
        this.isIssuing = false;
        
        // Remove issued students from list
        this.students = this.students.filter(s => !s.selected);
        this.selectAll = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to issue admit cards', err);
        this.errorMessage = 'Failed to issue admit cards. Please try again.';
        this.isIssuing = false;
        this.cdr.detectChanges();
      }
    });
  }
}
