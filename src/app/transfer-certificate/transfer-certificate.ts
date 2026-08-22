import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-transfer-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transfer-certificate.html',
  styleUrls: ['./transfer-certificate.css']
})
export class TransferCertificateComponent implements OnInit {
  activeStudents: any[] = [];
  issuedTCs: any[] = [];

  // Form Model
  newTc = {
    studentId: '',
    reasonForLeaving: '',
    academicProgress: 'Good',
    conduct: 'Good'
  };

  isGenerating = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadActiveStudents();
    this.loadIssuedTCs();
  }

  loadActiveStudents() {
    this.http.get<any[]>('http://localhost:5120/api/Students').subscribe({
      next: (data) => {
        this.activeStudents = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load students', err)
    });
  }

  loadIssuedTCs() {
    this.http.get<any[]>('http://localhost:5120/api/TC').subscribe({
      next: (data) => {
        this.issuedTCs = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load TCs', err)
    });
  }

  generateTC() {
    if (!this.newTc.studentId || !this.newTc.reasonForLeaving) {
      this.errorMessage = 'Please select a student and provide a reason for leaving.';
      return;
    }

    this.isGenerating = true;
    this.errorMessage = '';

    const payload = {
      studentId: parseInt(this.newTc.studentId, 10),
      reasonForLeaving: this.newTc.reasonForLeaving,
      academicProgress: this.newTc.academicProgress,
      conduct: this.newTc.conduct,
      tcNumber: 'TBD' // Bypass [Required] validation since backend generates it
    };

    this.http.post('http://localhost:5120/api/TC/Generate', payload).subscribe({
      next: () => {
        this.isGenerating = false;
        this.successMessage = 'Transfer Certificate generated successfully! The student has been marked as inactive.';
        
        // Reset form
        this.newTc = {
          studentId: '',
          reasonForLeaving: '',
          academicProgress: 'Good',
          conduct: 'Good'
        };

        this.loadActiveStudents(); // Refresh to remove the generated student
        this.loadIssuedTCs(); // Refresh to show new TC

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 5000);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to generate TC', err);
        this.isGenerating = false;
        
        // Extract string from validation error object
        if (err.error && typeof err.error === 'object') {
          if (err.error.errors) {
            this.errorMessage = Object.values(err.error.errors).flat().join(' ');
          } else {
            this.errorMessage = err.error.title || 'An error occurred during generation.';
          }
        } else {
          this.errorMessage = err.error || 'Failed to generate Transfer Certificate.';
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  printTC(tc: any) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const issueDate = new Date(tc.issueDate).toLocaleDateString();
    const student = tc.student;

    const htmlContent = `
      <html>
        <head>
          <title>Transfer Certificate - ${tc.tcNumber}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
            .header h3 { margin: 5px 0 0 0; color: #666; font-weight: normal; }
            .tc-info { display: flex; justify-content: space-between; margin-bottom: 40px; font-weight: bold; }
            .content table { w-full; border-collapse: collapse; margin-top: 20px; width: 100%; }
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
              <tr><td class="label">1. Name of Student</td><td>${student.firstName} ${student.lastName}</td></tr>
              <tr><td class="label">2. Admission Number</td><td>${student.admissionNumber}</td></tr>
              <tr><td class="label">3. Father's Name</td><td>${student.fatherName || 'N/A'}</td></tr>
              <tr><td class="label">4. Mother's Name</td><td>${student.motherName || 'N/A'}</td></tr>
              <tr><td class="label">5. Date of Birth</td><td>${new Date(student.dateOfBirth).toLocaleDateString()}</td></tr>
              <tr><td class="label">6. Class Left</td><td>Class ${student.currentClass}</td></tr>
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
