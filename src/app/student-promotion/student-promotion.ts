import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-student-promotion',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './student-promotion.html',
  styleUrls: []
})
export class StudentPromotionComponent implements OnInit {
  classes: string[] = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Alumni'];
  selectedClass: string = '';
  nextClass: string = '';
  
  students: any[] = [];
  selectedStudentIds: Set<number> = new Set();
  
  isLoading = false;
  isPromoting = false;
  successMessage = '';
  errorMessage = '';
  selectAll = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  fetchStudents() {
    if (!this.selectedClass) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students').subscribe({
      next: (data) => {
        this.students = data.filter(s => s.currentClass === this.selectedClass);
        this.selectedStudentIds.clear();
        this.selectAll = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching students', err);
        this.errorMessage = 'Failed to load students.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleSelectAll() {
    if (this.selectAll) {
      this.students.forEach(s => this.selectedStudentIds.add(s.id));
    } else {
      this.selectedStudentIds.clear();
    }
  }

  toggleStudentSelection(studentId: number) {
    if (this.selectedStudentIds.has(studentId)) {
      this.selectedStudentIds.delete(studentId);
      this.selectAll = false;
    } else {
      this.selectedStudentIds.add(studentId);
      if (this.selectedStudentIds.size === this.students.length) {
        this.selectAll = true;
      }
    }
  }

  promoteStudents() {
    if (this.selectedStudentIds.size === 0) {
      this.errorMessage = 'Please select at least one student to promote.';
      return;
    }
    if (!this.nextClass) {
      this.errorMessage = 'Please select the next class.';
      return;
    }

    this.isPromoting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const request = {
      studentIds: Array.from(this.selectedStudentIds),
      nextClass: this.nextClass
    };

    this.http.post('https://erpschoolapi.onrender.com/api/Promotion/Promote', request).subscribe({
      next: (res: any) => {
        this.successMessage = res.message || 'Students promoted successfully.';
        this.isPromoting = false;
        this.selectedClass = '';
        this.nextClass = '';
        this.students = [];
        this.selectedStudentIds.clear();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Promotion error', err);
        this.errorMessage = err.error?.message || err.error || 'Failed to promote students.';
        this.isPromoting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
