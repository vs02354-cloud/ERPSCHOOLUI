import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AssignmentService } from '../services/assignment.service';
import { AuthService } from '../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-assignment-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assignment-details.component.html',
  styleUrls: []
})
export class AssignmentDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private assignmentService = inject(AssignmentService);
  private authService = inject(AuthService);

  assignment: any;
  allSubmissions: any[] = [];
  mySubmission: any = null;
  
  isLoading = true;
  userRole = '';
  apiUrl = 'https://erpschoolapi.onrender.com';

  // Student submission vars
  selectedFile: File | null = null;
  isSubmitting = false;

  // Teacher evaluate vars
  evaluatingId: number | null = null;
  evaluation = {
    marksObtained: 0,
    teacherRemark: '',
    status: 'Evaluated'
  };
  isSavingEval = false;

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetails(Number(id));
    }
  }

  loadDetails(id: number) {
    this.isLoading = true;
    this.assignmentService.getAssignmentDetails(id).subscribe({
      next: (res) => {
        this.assignment = res.assignment;
        if (this.userRole === 'Student') {
          this.mySubmission = res.mySubmission;
        } else {
          this.allSubmissions = res.allSubmissions || [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load assignment', err);
        this.isLoading = false;
      }
    });
  }

  getDownloadUrl(path: string): string {
    if (!path) return '';
    return this.apiUrl + path;
  }

  // ---- Student Actions ----

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  submitAssignment() {
    if (!this.selectedFile) {
      alert('Please select a file to submit.');
      return;
    }

    this.isSubmitting = true;
    
    // First upload file
    this.assignmentService.uploadFile(this.selectedFile).subscribe({
      next: (uploadRes) => {
        const payload = {
          filePath: uploadRes.filePath
        };
        // Then save submission record
        this.assignmentService.submitAssignment(this.assignment.assignmentId, payload as any).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadDetails(this.assignment.assignmentId);
          },
          error: (err) => {
            console.error(err);
            alert('Failed to submit assignment.');
            this.isSubmitting = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        alert('File upload failed.');
        this.isSubmitting = false;
      }
    });
  }

  // ---- Teacher Actions ----

  startEvaluation(sub: any) {
    this.evaluatingId = sub.submissionId;
    this.evaluation = {
      marksObtained: sub.marksObtained || 0,
      teacherRemark: sub.teacherRemark || '',
      status: sub.status === 'Late Submitted' || sub.status === 'Submitted' ? 'Evaluated' : sub.status
    };
  }

  cancelEvaluation() {
    this.evaluatingId = null;
  }

  saveEvaluation() {
    if (!this.evaluatingId) return;
    this.isSavingEval = true;

    this.assignmentService.evaluateSubmission(this.evaluatingId, this.evaluation)
      .pipe(finalize(() => this.isSavingEval = false))
      .subscribe({
        next: () => {
          this.evaluatingId = null;
          this.loadDetails(this.assignment.assignmentId);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to save evaluation.');
        }
      });
  }
}
