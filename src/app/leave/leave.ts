import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService, LeaveRequest } from '../services/leave.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './leave.html',
  styleUrl: './leave.css',
})
export class Leave implements OnInit {
  leaveForm!: FormGroup;
  myLeaves: LeaveRequest[] = [];
  myStudents: any[] = [];
  userRole: string | null = '';
  isSubmitting = false;
  isLoadingHistory = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    
    this.leaveForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required],
      studentId: [null]
    });

    if (this.userRole === 'Parent') {
      this.leaveForm.get('studentId')?.setValidators([Validators.required]);
      this.fetchStudents();
    }

    this.fetchLeaves();
  }

  fetchStudents() {
    this.leaveService.getMyStudents().subscribe({
      next: (data) => {
        this.myStudents = data;
        // Auto-select if there is only one child
        if (this.myStudents.length === 1) {
          this.leaveForm.get('studentId')?.setValue(this.myStudents[0].id);
        } else {
          this.leaveForm.get('studentId')?.setValue(null);
        }
      },
      error: (err) => {
        console.error('Failed to load students', err);
      }
    });
  }

  fetchLeaves() {
    this.isLoadingHistory = true;
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => {
        this.myLeaves = data;
        this.isLoadingHistory = false;
      },
      error: (err) => {
        console.error('Failed to load leaves', err);
        this.isLoadingHistory = false;
      }
    });
  }

  onSubmit() {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.leaveForm.value;
    const leaveRequest: LeaveRequest = {
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      reason: formValue.reason,
      studentId: formValue.studentId
    };

    this.leaveService.applyLeave(leaveRequest).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = 'Leave request submitted successfully!';
        this.leaveForm.reset();
        
        // Attach student details for instant UI display
        if (leaveRequest.studentId) {
          const selectedStudent = this.myStudents.find(s => s.id === leaveRequest.studentId);
          if (selectedStudent) {
            res.student = selectedStudent;
          }
        }
        
        // Prepend to array for instant display
        this.myLeaves.unshift(res);
        
        // Optionally fetch in background to ensure sync
        this.leaveService.getMyLeaves().subscribe(data => this.myLeaves = data);
        
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit leave request. Please try again.';
        console.error(err);
      }
    });
  }

  isUpcoming(startDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    return start >= today;
  }

  cancelLeave(leave: LeaveRequest) {
    if (!leave.id) return;
    
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this.leaveService.cancelLeave(leave.id).subscribe({
        next: () => {
          leave.status = 'cancelled';
          this.successMessage = 'Leave request cancelled successfully.';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Failed to cancel leave request.';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }
}
