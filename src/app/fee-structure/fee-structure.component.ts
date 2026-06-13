import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../services/language.service';

interface FeeStructure {
  id?: number;
  className: string;
  academicYear: string;
  tuitionFee: number;
  transportFee: number;
  libraryFee: number;
  miscellaneousFee: number;
  totalFee?: number;
}

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './fee-structure.component.html',
  styleUrls: []
})
export class FeeStructureComponent implements OnInit {
  feeForm: FormGroup;
  feeStructures: FeeStructure[] = [];
  filteredStructures: FeeStructure[] = [];
  
  // Search criteria
  searchClass: string = '';
  searchYear: string = '';

  isSubmitting = false;
  isLoading = false;
  editMode = false;
  currentEditId: number | null = null;
  
  successMessage = '';
  errorMessage = '';

  classes: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  academicYears: string[] = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];

  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.feeForm = this.fb.group({
      className: ['', Validators.required],
      academicYear: ['2026-2027', Validators.required],
      tuitionFee: [0, [Validators.required, Validators.min(0)]],
      transportFee: [0, [Validators.required, Validators.min(0)]],
      libraryFee: [0, [Validators.required, Validators.min(0)]],
      miscellaneousFee: [0, [Validators.required, Validators.min(0)]]
    });

    // Auto-calculate total visually (though backend calculates it too)
    this.feeForm.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.loadFeeStructures();
  }

  get totalCalculatedFee(): number {
    const vals = this.feeForm.value;
    return (vals.tuitionFee || 0) + (vals.transportFee || 0) + (vals.libraryFee || 0) + (vals.miscellaneousFee || 0);
  }

  loadFeeStructures() {
    this.isLoading = true;
    this.http.get<FeeStructure[]>('https://erpschoolapi.onrender.com/api/Fees/Structure').subscribe({
      next: (data) => {
        this.feeStructures = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load fee structures', err);
        this.errorMessage = 'Failed to load data from server.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchClassChange(event: any) {
    this.searchClass = event.target.value;
    this.applyFilter();
  }

  onSearchYearChange(event: any) {
    this.searchYear = event.target.value;
    this.applyFilter();
  }

  applyFilter() {
    this.filteredStructures = this.feeStructures.filter(f => {
      const matchClass = this.searchClass ? f.className === this.searchClass : true;
      const matchYear = this.searchYear ? f.academicYear === this.searchYear : true;
      return matchClass && matchYear;
    });
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.feeForm.value;

    if (this.editMode && this.currentEditId) {
      // Update
      payload.id = this.currentEditId;
      this.http.put(`https://erpschoolapi.onrender.com/api/Fees/Structure/${this.currentEditId}`, payload).subscribe({
        next: () => {
          this.successMessage = 'Fee structure updated successfully!';
          this.resetForm();
          this.loadFeeStructures();
        },
        error: (err) => {
          this.errorMessage = err.error?.Message || 'Failed to update fee structure.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create
      this.http.post<FeeStructure>('https://erpschoolapi.onrender.com/api/Fees/Structure', payload).subscribe({
        next: () => {
          this.successMessage = 'Fee structure created successfully!';
          this.resetForm();
          this.loadFeeStructures();
        },
        error: (err) => {
          this.errorMessage = err.error?.Message || 'Failed to create fee structure.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editStructure(structure: FeeStructure) {
    this.editMode = true;
    this.currentEditId = structure.id!;
    this.feeForm.patchValue({
      className: structure.className,
      academicYear: structure.academicYear,
      tuitionFee: structure.tuitionFee,
      transportFee: structure.transportFee,
      libraryFee: structure.libraryFee,
      miscellaneousFee: structure.miscellaneousFee
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cdr.detectChanges();
  }

  deleteStructure(id: number) {
    if (confirm('Are you sure you want to delete this fee structure?')) {
      this.http.delete(`https://erpschoolapi.onrender.com/api/Fees/Structure/${id}`).subscribe({
        next: () => {
          this.successMessage = 'Deleted successfully!';
          this.loadFeeStructures();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete fee structure.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  resetForm() {
    this.editMode = false;
    this.currentEditId = null;
    this.isSubmitting = false;
    this.feeForm.reset({
      academicYear: '2026-2027',
      tuitionFee: 0,
      transportFee: 0,
      libraryFee: 0,
      miscellaneousFee: 0
    });
    this.cdr.detectChanges();
  }
}
