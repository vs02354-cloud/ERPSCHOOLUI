import { Component, OnInit } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-commission-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, FlatpickrModule, TranslatePipe],
  templateUrl: './commission-management.html'
})
export class CommissionManagementComponent implements OnInit {
  activeTab = 'settings'; // 'settings', 'reports'
  settingsForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  activeSetting: any = null;
  commissionReports: any[] = [];
  teachersList: any[] = [];
  isLoadingReports = false;

  filterTeacherId: number | null = null;
  filterStartDate: string = '';
  filterEndDate: string = '';

  private readonly API_URL = 'https://erpschoolapi.onrender.com/api/Commission';
  private readonly HR_API_URL = 'https://erpschoolapi.onrender.com/api/HR/Teachers';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.settingsForm = this.fb.group({
      commissionType: ['Percentage', Validators.required],
      commissionValue: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadActiveSetting();
    this.loadTeachers();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
    if (tab === 'reports') {
      this.loadReports();
    }
  }

  loadActiveSetting() {
    this.http.get<any[]>(`${this.API_URL}/Settings`).subscribe({
      next: (data) => {
        const active = data.find(s => s.isActive);
        if (active) {
          this.activeSetting = active;
          this.settingsForm.patchValue({
            commissionType: active.commissionType,
            commissionValue: active.commissionValue
          });
        }
      },
      error: (err) => console.error(err)
    });
  }

  loadTeachers() {
    this.http.get<any[]>(this.HR_API_URL).subscribe({
      next: (data) => this.teachersList = data,
      error: (err) => console.error(err)
    });
  }

  onSaveSettings() {
    if (this.settingsForm.invalid) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      ...this.settingsForm.value,
      isActive: true
    };

    this.http.post(`${this.API_URL}/Settings`, payload).subscribe({
      next: (res) => {
        this.successMessage = 'Commission settings updated successfully!';
        this.isSubmitting = false;
        this.loadActiveSetting();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to update commission settings.';
        this.isSubmitting = false;
      }
    });
  }

  loadReports() {
    this.isLoadingReports = true;
    let url = `${this.API_URL}/Reports?`;
    
    if (this.filterTeacherId) url += `teacherId=${this.filterTeacherId}&`;
    if (this.filterStartDate) url += `startDate=${this.filterStartDate}&`;
    if (this.filterEndDate) url += `endDate=${this.filterEndDate}&`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.commissionReports = data;
        this.isLoadingReports = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load commission reports.';
        this.isLoadingReports = false;
      }
    });
  }

  markAsPaid(id: number) {
    if (!confirm('Are you sure you want to mark this commission as paid?')) return;

    this.http.put(`${this.API_URL}/Reports/${id}/Pay`, {}).subscribe({
      next: () => {
        this.successMessage = 'Commission marked as paid!';
        this.loadReports();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to mark as paid.';
      }
    });
  }

  applyFilters() {
    this.loadReports();
  }

  clearFilters() {
    this.filterTeacherId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadReports();
  }
}

