import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportGatePass } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-transport-gatepass',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-gatepass.html',
  styleUrls: ['./transport-gatepass.css']
})
export class TransportGatepass implements OnInit {
  gatePasses: TransportGatePass[] = [];
  isLoading = true;
  isAdminOrManager = false;

  constructor(
    private transportService: TransportService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAdminOrManager = role === 'Admin' || role === 'Super Admin' || role === 'School Admin' || role === 'Transport Manager';
    this.loadGatePasses();
  }

  loadGatePasses() {
    this.isLoading = true;
    
    if (this.isAdminOrManager) {
      this.transportService.getGatePasses().subscribe({
        next: (data) => {
          this.gatePasses = data;
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
      this.transportService.getMyGatePass().subscribe({
        next: (data) => {
          this.gatePasses = data ? [data] : [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.gatePasses = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  generatePass() {
    const studentIdentifier = prompt('Enter Student ID or Admission Number to generate a Gate Pass:');
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

  scanPass() {
    const qrData = prompt('Scan or enter QR Code data to verify:');
    if (!qrData) return;
    
    this.transportService.verifyGatePass(qrData).subscribe({
      next: (res) => {
        alert('Verification Successful!\nStudent ID: ' + res.studentId + '\nRoute: ' + res.routeId + '\nStatus: Valid');
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
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .card { border: 2px solid #333; padding: 20px; width: 300px; margin: 0 auto; border-radius: 10px; }
            h2 { margin-bottom: 5px; }
            .details { margin: 20px 0; text-align: left; font-size: 14px; line-height: 1.6; }
            .qr { margin-top: 20px; border: 1px solid #ccc; padding: 10px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>School Transport Gate Pass</h2>
            <h3>${pass.student?.firstName} ${pass.student?.lastName}</h3>
            <p style="color: #666; margin-top: -10px;">${pass.student?.admissionNumber}</p>
            <div class="details">
              <strong>Route:</strong> ${pass.route?.routeName || 'N/A'}<br>
              <strong>Vehicle:</strong> ${pass.vehicle?.vehicleNumber || 'N/A'}<br>
              <strong>Valid Until:</strong> ${pass.validUntil ? new Date(pass.validUntil).toLocaleDateString() : 'N/A'}
            </div>
            <div class="qr">
              <p style="margin: 0; font-size: 10px; color: #999;">QR Data</p>
              <strong>${pass.qrCodeData.substring(0, 8)}...</strong>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert('Please allow popups to print passes.');
    }
  }
}
