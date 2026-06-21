import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../services/language.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tc-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './tc-apply.component.html'
})
export class TcApplyComponent implements OnInit {
  availableStudents: any[] = [];
  
  newTc = {
    studentId: '',
    reasonForLeaving: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  userRole = '';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || '';
    this.loadStudents();
  }

  loadStudents() {
    let endpoint = 'https://erpschoolapi.onrender.com/api/Students';
    if (this.userRole === 'Parent') {
      endpoint = 'https://erpschoolapi.onrender.com/api/Students/MyChildren';
    }

    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        // Only show active students
        this.availableStudents = data.filter(s => s.isActive);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load students', err)
    });
  }

  applyTC() {
    if (!this.newTc.studentId || !this.newTc.reasonForLeaving) {
      this.errorMessage = 'Please select a student and provide a reason for leaving.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      studentId: parseInt(this.newTc.studentId, 10),
      reasonForLeaving: this.newTc.reasonForLeaving
    };

    this.http.post('https://erpschoolapi.onrender.com/api/TC/Apply', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Transfer Certificate application submitted successfully! It will be reviewed by the administration.';
        
        // Reset form
        this.newTc = {
          studentId: '',
          reasonForLeaving: ''
        };

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 8000);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to apply for TC', err);
        this.isSubmitting = false;
        
        if (err.error && typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Failed to submit Transfer Certificate application. Please try again.';
        }
        
        this.cdr.detectChanges();
      }
    });
  }
}
