import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InquiryService, AdmissionInquiry, InquirySummary } from '../services/inquiry';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-inquiry-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquiry-dashboard.html',
  styleUrl: './inquiry-dashboard.css'
})
export class InquiryDashboard implements OnInit {
  private inquiryService = inject(InquiryService);

  inquiries: AdmissionInquiry[] = [];
  summary: InquirySummary | null = null;
  
  isLoading = false;
  isSaving = false;

  // Filters
  selectedStatus = 'All';
  searchQuery = '';

  // Modal State
  selectedInquiry: AdmissionInquiry | null = null;
  newStatus = '';
  followUpDate = '';
  remarks = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.inquiryService.getSummary().subscribe(res => this.summary = res);
    
    this.inquiryService.getInquiries(this.selectedStatus, this.searchQuery)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(res => {
        this.inquiries = res;
      });
  }

  onFilterChange() {
    this.loadData();
  }

  openFollowUpModal(inquiry: AdmissionInquiry) {
    this.selectedInquiry = inquiry;
    this.newStatus = inquiry.inquiryStatus;
    this.followUpDate = inquiry.followUpDate ? new Date(inquiry.followUpDate).toISOString().split('T')[0] : '';
    this.remarks = '';
  }

  closeModal() {
    this.selectedInquiry = null;
  }

  saveFollowUp() {
    if (!this.selectedInquiry) return;

    this.isSaving = true;
    const data = {
      status: this.newStatus,
      followUpDate: this.followUpDate || undefined,
      remarks: this.remarks
    };

    this.inquiryService.updateStatus(this.selectedInquiry.inquiryId, data)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.closeModal();
          this.loadData(); // Refresh list and summary
        },
        error: (err) => console.error(err)
      });
  }

  getStatusCount(status: string): number {
    if (!this.summary) return 0;
    const detail = this.summary.details.find(d => d.status === status);
    return detail ? detail.count : 0;
  }

  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Interested': return 'bg-purple-100 text-purple-800';
      case 'Admission Confirmed': return 'bg-green-100 text-green-800';
      case 'Not Interested': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
