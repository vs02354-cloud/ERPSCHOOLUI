import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admission-form.component.html',
  styleUrls: []
})
export class AdmissionFormComponent implements OnInit {
  admissionForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  studentId: number | null = null;
  pageTitle = 'New Student Admission';
  pageDescription = 'Fill out the information below for the admission process.';
  submitButtonText = 'Submit Admission';
  
  teachersList: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.admissionForm = this.fb.group({
      id: [0], // added for edit mode
      applicationUserId: [null], // added for edit mode mapping
      firstName: ['', Validators.required],
      lastName: [''],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: [''],
      category: ['', Validators.required],
      fatherName: ['', Validators.required],
      motherName: ['', Validators.required],
      parentContactNumber: ['', Validators.required],
      address: ['', Validators.required],
      currentClass: ['', Validators.required],
      section: ['A'],
      previousSchool: [''],
      transportRequired: [false],
      referredByEmployeeId: [null],
      admissionNumber: ['PENDING'],
      admissionDate: [new Date().toISOString()] // needed for updates to not nullify it
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.isEditMode = true;
        this.studentId = +idStr;
        this.pageTitle = 'Edit Student Details';
        this.pageDescription = 'Update the information below to modify the student record.';
        this.submitButtonText = 'Update Student';
        this.loadStudentDetails(this.studentId);
      }
    });
    this.loadTeachers();
  }

  loadTeachers() {
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/HR/Teachers').subscribe({
      next: (data) => {
        this.teachersList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load teachers', err)
    });
  }

  loadStudentDetails(id: number) {
    this.http.get<any>(`https://erpschoolapi.onrender.com/api/Students/${id}`).subscribe({
      next: (student) => {
        // format date correctly for input[type=date]
        if (student.dateOfBirth) {
          student.dateOfBirth = student.dateOfBirth.split('T')[0];
        }
        this.admissionForm.patchValue(student);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load student details.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.admissionForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const payload = this.admissionForm.value;

      if (this.isEditMode && this.studentId) {
        // PUT Request
        this.http.put(`https://erpschoolapi.onrender.com/api/Students/${this.studentId}`, payload).subscribe({
          next: () => {
            this.successMessage = 'Student details updated successfully!';
            this.isSubmitting = false;
            this.cdr.detectChanges();
            // Optionally navigate back to list after a delay
            setTimeout(() => this.router.navigate(['/dashboard/students']), 1500);
          },
          error: (error) => this.handleError(error)
        });
      } else {
        // POST Request
        this.http.post<any>('https://erpschoolapi.onrender.com/api/Students/Admission', payload).subscribe({
          next: (response) => {
            this.successMessage = 'Student admission successful! Registration ID: ' + response.admissionNumber;
            this.isSubmitting = false;
            this.admissionForm.reset();
            this.cdr.detectChanges();
          },
          error: (error) => this.handleError(error)
        });
      }
    } else {
      Object.keys(this.admissionForm.controls).forEach(key => {
        this.admissionForm.get(key)?.markAsTouched();
      });
    }
  }

  private handleError(error: any) {
    let errorDetail = error.message;
    if (error.error) {
      errorDetail = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
    }
    this.errorMessage = `${this.isEditMode ? 'Update' : 'Admission'} failed (${error.status}). Details: ${errorDetail}`;
    console.error('API Error:', error);
    this.isSubmitting = false;
    this.cdr.detectChanges();
  }
}
