import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportGatePass } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transport-gatepass',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-gatepass.html',
  styleUrls: ['./transport-gatepass.css']
})
export class TransportGatepass implements OnInit {
  allGatePasses: TransportGatePass[] = [];
  gatePasses: TransportGatePass[] = [];
  isLoading = true;
  isAdminOrManager = false;
  activeTab: 'All' | 'Pending' | 'Approved' | 'Rejected' = 'All';
  hasTransportFacility: boolean = true;

  constructor(
    private transportService: TransportService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAdminOrManager = role === 'Admin' || role === 'Super Admin' || role === 'School Admin' || role === 'Transport Manager';
    
    if (role === 'Parent') {
      this.hasTransportFacility = false;
      this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students/MyChildren').subscribe({
        next: (children) => {
          this.hasTransportFacility = children.some(c => c.transportRequired);
          if (this.hasTransportFacility) {
            this.loadGatePasses();
          } else {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loadGatePasses();
    }
  }

  loadGatePasses() {
    this.isLoading = true;
    
    if (this.isAdminOrManager) {
      this.transportService.getGatePasses().subscribe({
        next: (data) => {
          this.allGatePasses = data;
          this.filterPasses();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.transportService.getMyGatePasses().subscribe({
        next: (data) => {
          this.allGatePasses = data || [];
          this.filterPasses();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.allGatePasses = [];
          this.gatePasses = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  setTab(tab: 'All' | 'Pending' | 'Approved' | 'Rejected') {
    this.activeTab = tab;
    this.filterPasses();
  }

  filterPasses() {
    if (this.activeTab === 'All') {
      this.gatePasses = this.allGatePasses;
    } else if (this.activeTab === 'Pending') {
      this.gatePasses = this.allGatePasses.filter(p => p.status === 0);
    } else if (this.activeTab === 'Approved') {
      this.gatePasses = this.allGatePasses.filter(p => p.status === 1);
    } else if (this.activeTab === 'Rejected') {
      this.gatePasses = this.allGatePasses.filter(p => p.status === 2);
    }
  }

  generatePass() {
    const studentIdentifier = prompt('Enter Student ID or Admission Number to generate an Approved Gate Pass:');
    if (!studentIdentifier) return;
    
    this.transportService.generateGatePass(studentIdentifier).subscribe({
      next: (pass) => {
        alert('Gate Pass generated successfully!');
        this.loadGatePasses();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error && typeof err.error === 'string' ? err.error : 'Unknown error occurred.';
        alert(`Failed to generate gate pass: ${errorMsg}`);
      }
    });
  }

  requestPass() {
    this.transportService.requestGatePass().subscribe({
      next: (pass) => {
        alert('Gate Pass requested successfully! It is pending approval from Admin.');
        this.loadGatePasses();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error && typeof err.error === 'string' ? err.error : 'Unknown error occurred.';
        alert(`Failed to request gate pass: ${errorMsg}`);
      }
    });
  }

  approvePass(pass: TransportGatePass) {
    if (!pass.id) return;
    const remarks = prompt('Enter remarks (optional):') || '';
    this.transportService.approveGatePass(pass.id, remarks).subscribe({
      next: () => {
        alert('Gate pass approved successfully.');
        this.loadGatePasses();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to approve gate pass.');
      }
    });
  }

  rejectPass(pass: TransportGatePass) {
    if (!pass.id) return;
    const remarks = prompt('Enter remarks for rejection:') || '';
    this.transportService.rejectGatePass(pass.id, remarks).subscribe({
      next: () => {
        alert('Gate pass rejected successfully.');
        this.loadGatePasses();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to reject gate pass.');
      }
    });
  }

  scanPass() {
    const qrData = prompt('Scan or enter QR Code data to verify:');
    if (!qrData) return;
    
    this.transportService.verifyGatePass(qrData).subscribe({
      next: (res) => {
        alert('Verification Successful!\nStudent Name: ' + res.studentName + '\nRoute: ' + res.routeName + '\nStatus: Valid');
      },
      error: (err) => {
        console.error(err);
        alert('Verification Failed! Invalid or expired pass.');
      }
    });
  }

  revokePass(pass: TransportGatePass) {
    if (!pass.id) return;
    if (confirm(`Are you sure you want to revoke the gate pass for ${pass.student?.firstName}?`)) {
      this.transportService.revokeGatePass(pass.id).subscribe({
        next: () => {
          alert('Gate pass revoked successfully.');
          this.loadGatePasses();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to revoke gate pass.');
        }
      });
    }
  }

  printPass(pass: TransportGatePass) {
    const printContent = `
      <html>
        <head>
          <title>Print Gate Pass</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            @page { margin: 0; size: 2.125in 3.375in; } /* Standard CR80 ID Card size */
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 0; 
              background: #fff;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .id-card { 
              width: 2.125in; 
              height: 3.375in; 
              border: 1px solid #ccc;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .header {
              background-color: #4f46e5;
              color: white;
              text-align: center;
              padding: 6px 4px;
              font-size: 8px;
            }
            .header h1 { margin: 0; font-size: 10px; font-weight: 700; }
            .header p { margin: 2px 0 0; font-size: 6px; }
            .title {
              background-color: #f3f4f6;
              text-align: center;
              font-size: 8px;
              font-weight: 600;
              padding: 3px 0;
              border-bottom: 1px solid #e5e7eb;
              letter-spacing: 0.5px;
            }
            .content {
              padding: 8px;
              text-align: center;
            }
            .photo {
              width: 45px;
              height: 45px;
              background-color: #e5e7eb;
              border: 2px solid #4f46e5;
              border-radius: 4px;
              margin: 0 auto 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .photo svg { width: 24px; height: 24px; color: #9ca3af; }
            .student-name {
              font-size: 10px;
              font-weight: 700;
              margin: 0 0 2px;
              color: #111827;
            }
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
              text-align: left;
              margin-top: 6px;
              font-size: 7px;
              border-top: 1px dashed #e5e7eb;
              padding-top: 6px;
            }
            .label { color: #6b7280; font-size: 6px; }
            .value { color: #111827; font-weight: 600; margin-bottom: 2px; }
            
            .qr-section {
              position: absolute;
              bottom: 8px;
              left: 8px;
              right: 8px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .qr-box {
              width: 35px;
              height: 35px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .signature {
              text-align: center;
            }
            .sig-line {
              width: 40px;
              border-top: 1px solid #000;
              margin-top: 15px;
            }
            .sig-text {
              font-size: 5px;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <h1>INTERNATIONAL SCHOOL</h1>
              <p>Transport Department</p>
            </div>
            <div class="title">TRANSPORT GATE PASS</div>
            
            <div class="content">
              <div class="photo">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              
              <h2 class="student-name">${pass.student?.firstName} ${pass.student?.lastName}</h2>
              
              <div class="details-grid">
                <div>
                  <div class="label">Admission No</div>
                  <div class="value">${pass.student?.admissionNumber || 'N/A'}</div>
                </div>
                <div>
                  <div class="label">Class & Sec</div>
                  <div class="value">${pass.student?.currentClass || 'N/A'} ${pass.student?.section || ''}</div>
                </div>
                <div>
                  <div class="label">Route</div>
                  <div class="value">${pass.route?.routeName || 'N/A'}</div>
                </div>
                <div>
                  <div class="label">Vehicle No</div>
                  <div class="value">${pass.vehicle?.vehicleNumber || 'N/A'}</div>
                </div>
                <div>
                  <div class="label">Issue Date</div>
                  <div class="value">${pass.issueDate ? new Date(pass.issueDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div class="label">Valid Until</div>
                  <div class="value">${pass.validUntil ? new Date(pass.validUntil).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div class="qr-section">
              <div class="qr-box">
                 <svg style="width:25px; height:25px;" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h-3v2h3v-2zm-3 4h3v2h-3v-2zm-2-2h2v2h-2v-2zm0-2h2v2h-2v-2zm4-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-4 4h8v2h-8v-2z"></path>
                 </svg>
              </div>
              <div class="signature">
                <div class="sig-line"></div>
                <div class="sig-text">Auth. Sign</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert('Please allow popups to print passes.');
    }
  }
}
