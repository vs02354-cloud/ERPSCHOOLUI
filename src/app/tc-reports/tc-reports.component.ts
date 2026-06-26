import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-tc-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tc-reports.component.html'
})
export class TcReportsComponent implements OnInit {
  allReports: any[] = [];
  filteredReports: any[] = [];
  uniqueClasses: string[] = [];

  // Filters
  filterClass: string = '';
  filterName: string = '';
  filterAdmissionNo: string = '';
  filterDate: string = '';
  filterStatus: string = '';

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Modals
  showApproveModal = false;
  showViewModal = false;
  currentTC: any = null;
  isProcessing = false;

  approveData = {
    academicProgress: 'Good',
    conduct: 'Good'
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/TC').subscribe({
      next: (data) => {
        this.allReports = data || [];
        this.extractUniqueClasses();
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load TC reports', err);
        this.errorMessage = 'Failed to load transfer certificate reports.';
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
    this.filteredReports = this.allReports.filter(tc => {
      const matchClass = this.filterClass ? tc.student?.currentClass === this.filterClass : true;
      const matchName = this.filterName ? 
        `${tc.student?.firstName} ${tc.student?.lastName}`.toLowerCase().includes(this.filterName.toLowerCase()) : true;
      const matchAdmNo = this.filterAdmissionNo ? 
        tc.student?.admissionNumber?.toLowerCase().includes(this.filterAdmissionNo.toLowerCase()) : true;
      const matchStatus = this.filterStatus ? tc.status === this.filterStatus : true;
      
      let matchDate = true;
      if (this.filterDate) {
        const tcDate = new Date(tc.appliedDate).toISOString().split('T')[0];
        matchDate = tcDate === this.filterDate;
      }

      return matchClass && matchName && matchAdmNo && matchStatus && matchDate;
    });
    this.cdr.detectChanges();
  }

  exportToExcel() {
    const exportData = this.filteredReports.map((tc, index) => ({
      'S.No.': index + 1,
      'Admission No.': tc.student?.admissionNumber,
      'Student Name': `${tc.student?.firstName} ${tc.student?.lastName}`,
      'Class': tc.student?.currentClass,
      'Section': tc.student?.section || '-',
      'Applied Date': new Date(tc.appliedDate).toLocaleDateString(),
      'Reason': tc.reasonForLeaving,
      'Status': tc.status,
      'TC Number': tc.tcNumber || '-',
      'Issue Date': tc.issueDate ? new Date(tc.issueDate).toLocaleDateString() : '-'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'TC Reports': worksheet }, SheetNames: ['TC Reports'] };
    XLSX.writeFile(workbook, `TC_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  openViewModal(tc: any) {
    this.currentTC = tc;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.currentTC = null;
  }

  openApproveModal(tc: any) {
    this.currentTC = tc;
    this.approveData = { academicProgress: 'Good', conduct: 'Good' };
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.currentTC = null;
  }

  submitApprove() {
    if (!this.currentTC) return;
    
    this.isProcessing = true;
    const payload = {
      status: 'Approved',
      academicProgress: this.approveData.academicProgress,
      conduct: this.approveData.conduct
    };

    this.http.put(`https://erpschoolapi.onrender.com/api/TC/${this.currentTC.id}/Status`, payload).subscribe({
      next: () => {
        this.successMessage = 'Transfer Certificate approved and generated successfully!';
        this.isProcessing = false;
        this.closeApproveModal();
        this.loadReports(); // Refresh the list
        
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.error('Failed to approve TC', err);
        this.errorMessage = 'Failed to approve Transfer Certificate.';
        this.isProcessing = false;
        this.cdr.detectChanges();
        
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      }
    });
  }

  rejectTC(tc: any) {
    if (!confirm('Are you sure you want to reject this Transfer Certificate application?')) {
      return;
    }

    const payload = {
      status: 'Rejected',
      academicProgress: '',
      conduct: ''
    };

    this.http.put(`https://erpschoolapi.onrender.com/api/TC/${tc.id}/Status`, payload).subscribe({
      next: () => {
        this.successMessage = 'Transfer Certificate application rejected.';
        this.loadReports(); // Refresh the list
        
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.error('Failed to reject TC', err);
        this.errorMessage = 'Failed to reject Transfer Certificate application.';
        this.cdr.detectChanges();
      }
    });
  }

  private generateTCHtml(tc: any): string {
    const issueDate = new Date(tc.issueDate).toLocaleDateString();
    const student = tc.student;

    return `
      <html>
        <head>
          <title>Transfer Certificate - ${tc.tcNumber}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
            .header h3 { margin: 5px 0 0 0; color: #666; font-weight: normal; }
            .tc-info { display: flex; justify-content: space-between; margin-bottom: 40px; font-weight: bold; }
            .content table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .content td { padding: 12px 0; border-bottom: 1px dashed #ccc; }
            .content td.label { font-weight: bold; width: 40%; }
            .footer { margin-top: 80px; display: flex; justify-content: space-between; text-align: center; }
            .signature { border-top: 1px solid #333; width: 200px; padding-top: 10px; font-weight: bold; }
            @media print {
              body { padding: 0; margin: 20mm; }
              @page { size: A4; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SchoolERP International</h1>
            <h3>TRANSFER CERTIFICATE</h3>
          </div>
          
          <div class="tc-info">
            <div>TC No: ${tc.tcNumber}</div>
            <div>Date of Issue: ${issueDate}</div>
          </div>

          <div class="content">
            <p>This is to certify that the following student has been granted this Transfer Certificate.</p>
            <table>
              <tr><td class="label">1. Name of Student</td><td>${student?.firstName} ${student?.lastName}</td></tr>
              <tr><td class="label">2. Admission Number</td><td>${student?.admissionNumber}</td></tr>
              <tr><td class="label">3. Father's Name</td><td>${student?.fatherName || 'N/A'}</td></tr>
              <tr><td class="label">4. Mother's Name</td><td>${student?.motherName || 'N/A'}</td></tr>
              <tr><td class="label">5. Date of Birth</td><td>${student?.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</td></tr>
              <tr><td class="label">6. Class Left</td><td>Class ${student?.currentClass}</td></tr>
              <tr><td class="label">7. Reason for Leaving</td><td>${tc.reasonForLeaving}</td></tr>
              <tr><td class="label">8. Academic Progress</td><td>${tc.academicProgress}</td></tr>
              <tr><td class="label">9. Conduct</td><td>${tc.conduct}</td></tr>
            </table>
          </div>

          <div class="footer">
            <div class="signature">Prepared By</div>
            <div class="signature">Principal's Signature</div>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } };
          </script>
        </body>
      </html>
    `;
  }

  printTC(tc: any) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.generateTCHtml(tc);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  downloadTC(tc: any) {
    const htmlContent = this.generateTCHtml(tc);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transfer_Certificate_${tc.tcNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
