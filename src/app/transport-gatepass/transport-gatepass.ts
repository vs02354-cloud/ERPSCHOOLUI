import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportGatePass } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';

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

  constructor(private transportService: TransportService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadGatePasses();
  }

  loadGatePasses() {
    this.isLoading = true;
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
}
