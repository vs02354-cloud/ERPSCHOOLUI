import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssignmentService } from '../services/assignment.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-create-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-assignment.component.html',
  styleUrls: []
})
export class CreateAssignmentComponent {
  private assignmentService = inject(AssignmentService);
  private router = inject(Router);

  assignment = {
    title: '',
    description: '',
    subject: '',
    className: '',
    section: '',
    dueDate: '',
    maxMarks: 100,
    attachmentPath: ''
  };

  selectedFile: File | null = null;
  isSaving = false;
  uploadProgress = false;

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  saveAssignment() {
    this.isSaving = true;

    if (this.selectedFile) {
      this.uploadProgress = true;
      this.assignmentService.uploadFile(this.selectedFile).subscribe({
        next: (res) => {
          this.assignment.attachmentPath = res.filePath;
          this.uploadProgress = false;
          this.submitAssignmentData();
        },
        error: (err) => {
          console.error('File upload failed', err);
          this.uploadProgress = false;
          this.isSaving = false;
          alert('Failed to upload file.');
        }
      });
    } else {
      this.submitAssignmentData();
    }
  }

  private submitAssignmentData() {
    this.assignmentService.createAssignment(this.assignment)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/assignments']);
        },
        error: (err) => {
          console.error('Failed to create assignment', err);
          alert('Failed to create assignment.');
        }
      });
  }
}
