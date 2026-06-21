import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { FlatpickrModule } from 'angularx-flatpickr';

@Component({
  selector: 'app-leave-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrModule],
  templateUrl: './leave-reports.component.html'
})
export class LeaveReportsComponent implements OnInit {
  allReports: any[] = [];
  filteredReports: any[] = [];
  uniqueClasses: string[] = [];

  // Filters
  filterName: string = '';
  filterClass: string = '';
  filterDate: string = '';
  filterStatus: string = '';

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Modals
  showViewModal = false;
  showActionModal = false;
  currentLeave: any = null;
  actionType: 'approve' | 'Rejected' = 'approve';
  managerRemarks: string = '';
  isProcessing = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/LeaveRequests').subscribe({
      next: (data) => {
        this.allReports = data || [];
        this.extractUniqueClasses();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load leave reports', err);
        this.errorMessage = 'Failed to load leave reports.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  extractUniqueClasses() {
    const classes = this.allReports
      .map(r => r.student?.currentClass)
      .filter(c => c);
    this.uniqueClasses = [...new Set(classes)].sort();
  }

  applyFilters() {
    this.filteredReports = this.allReports.filter(leave => {
      const matchName = this.filterName ? 
        `${leave.student?.firstName} ${leave.student?.lastName}`.toLowerCase().includes(this.filterName.toLowerCase()) : true;
      const matchClass = this.filterClass ? leave.student?.currentClass === this.filterClass : true;
      const matchStatus = this.filterStatus ? leave.status === this.filterStatus : true;
      
      let matchDate = true;
      if (this.filterDate) {
        const filterDateObj = new Date(this.filterDate);
        filterDateObj.setHours(0,0,0,0);
        
        const startDate = new Date(leave.startDate);
        startDate.setHours(0,0,0,0);
        
        const endDate = new Date(leave.endDate);
        endDate.setHours(0,0,0,0);
        
        matchDate = filterDateObj >= startDate && filterDateObj <= endDate;
      }

      return matchName && matchClass && matchStatus && matchDate;
    });
    this.cdr.detectChanges();
  }

  exportToExcel() {
    const exportData = this.filteredReports.map((leave, index) => ({
      'S.No.': index + 1,
      'Student Name': `${leave.student?.firstName} ${leave.student?.lastName}`,
      'Class': leave.student?.currentClass,
      'Section': leave.student?.section || '-',
      'From Date': new Date(leave.startDate).toLocaleDateString(),
      'To Date': new Date(leave.endDate).toLocaleDateString(),
      'Reason': leave.reason,
      'Status': leave.status === 'approve' ? 'Approved' : (leave.status === 'cancelled' ? 'Cancelled' : leave.status),
      'Manager Remarks': leave.managerRemarks || '-'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Leave Reports': worksheet }, SheetNames: ['Leave Reports'] };
    XLSX.writeFile(workbook, `Leave_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  openViewModal(leave: any) {
    this.currentLeave = leave;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.currentLeave = null;
  }

  openApproveModal(leave: any) {
    this.currentLeave = leave;
    this.actionType = 'approve';
    this.managerRemarks = '';
    this.showActionModal = true;
  }

  openRejectModal(leave: any) {
    this.currentLeave = leave;
    this.actionType = 'Rejected';
    this.managerRemarks = '';
    this.showActionModal = true;
  }

  closeActionModal() {
    this.showActionModal = false;
    this.currentLeave = null;
  }

  submitAction() {
    if (!this.currentLeave) return;
    
    this.isProcessing = true;
    const payload = {
      status: this.actionType,
      managerRemarks: this.managerRemarks
    };

    this.http.put(`https://erpschoolapi.onrender.com/api/LeaveRequests/${this.currentLeave.id}/Status`, payload).subscribe({
      next: () => {
        this.successMessage = `Leave application ${this.actionType === 'approve' ? 'approved' : 'rejected'} successfully.`;
        this.isProcessing = false;
        this.closeActionModal();
        this.loadReports(); // Refresh the list
        
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.error('Failed to update leave status', err);
        this.errorMessage = `Failed to ${this.actionType === 'approve' ? 'approve' : 'reject'} leave application.`;
        this.isProcessing = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }
}
