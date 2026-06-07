import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssignmentService, AssignmentMaster } from '../services/assignment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  // Parent specific properties
  searchQuery: string = '';
  selectedChild: string = 'All Children';
  selectedStatus: string = 'All Statuses';
  parentChildren: string[] = []; // Extracted dynamically from mock data

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
    } else if (this.userRole === 'Parent') {
      // Mock data for Parent View
      setTimeout(() => {
        this.assignments = [
          {
            assignmentId: 101,
            title: 'Algebra Variables Worksheet',
            subject: 'Mathematics',
            className: 'Class 8',
            section: 'A',
            assignedDate: '2026-06-05',
            dueDate: '2026-06-10',
            status: 'Pending',
            childName: 'Vishendra Sharma',
            maxMarks: 50
          },
          {
            assignmentId: 102,
            title: 'Solar System Essay',
            subject: 'Science',
            className: 'Class 8',
            section: 'A',
            assignedDate: '2026-06-02',
            dueDate: '2026-06-06',
            status: 'Submitted',
            childName: 'Vishendra Sharma',
            maxMarks: 20
          },
          {
            assignmentId: 103,
            title: 'Photosynthesis Diagram',
            subject: 'Science',
            className: 'Class 3',
            section: 'B',
            assignedDate: '2026-05-25',
            dueDate: '2026-06-01',
            status: 'Overdue',
            childName: 'Moksh Sharma',
            maxMarks: 25
          }
        ];
        // Extract distinct children for filter dropdown
        this.parentChildren = [...new Set(this.assignments.map(a => a.childName))];
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500); // Simulate network latency
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

  get filteredAssignments(): any[] {
    if (this.userRole !== 'Parent') return this.assignments;

    return this.assignments.filter(assignment => {
      // Filter by child
      if (this.selectedChild !== 'All Children' && assignment.childName !== this.selectedChild) {
        return false;
      }
      
      // Filter by status
      if (this.selectedStatus !== 'All Statuses' && assignment.status !== this.selectedStatus) {
        return false;
      }

      // Filter by search query (subject or title)
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase().trim();
        const matchesTitle = assignment.title.toLowerCase().includes(query);
        const matchesSubject = assignment.subject.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }
}
