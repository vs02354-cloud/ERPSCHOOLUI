import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AssignmentService, AssignmentMaster } from '../services/assignment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './assignments.component.html',
  styleUrls: []
})
export class AssignmentsComponent implements OnInit {
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  assignments: any[] = [];
  isLoading: boolean = true;
  userRole: string = 'Student';

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || 'Student';
    this.loadAssignments();
  }

  loadAssignments() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    if (this.userRole === 'Student') {
      this.assignmentService.getStudentAssignments().subscribe({
        next: (data) => {
          this.assignments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading assignments', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.assignmentService.getAssignments().subscribe({
        next: (data) => {
          this.assignments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading assignments', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
