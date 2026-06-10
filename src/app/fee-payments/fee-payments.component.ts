import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  currentClass: string;
  section: string;
  parentContactNumber: string;
}

interface FeePayment {
  id?: number;
  studentId: number;
  student?: Student;
  receiptNumber?: string;
  amountPaid: number;
  paymentDate?: string;
  paymentMode: string;
  remarks: string;
}

@Component({
  selector: 'app-fee-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fee-payments.component.html',
  styleUrls: []
})
export class FeePaymentsComponent implements OnInit {
  activeTab: 'dashboard' | 'collect' | 'history' | 'pay-online' = 'dashboard';
  
  // Dashboard & Reports
  dashboardStats: any = null;
  pendingReport: any[] = [];
  
  // History
  allPayments: FeePayment[] = [];
  filteredPayments: FeePayment[] = [];
  searchHistoryTerm = '';

  // Collect Fee & Pay Online
  collectForm: FormGroup;
  students: Student[] = [];
  selectedStudent: Student | null = null;
  pendingFeeDetails: any = null;
  searchStudentTerm = '';
  
  // Receipt Modal
  showReceiptModal = false;
  currentReceipt: any = null;

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  paymentModes = ['Cash', 'UPI', 'Debit/Credit Card', 'Net Banking', 'Cheque'];

  userRole: string = '';

  // Parent Specific
  parentChildren: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient, private cdr: ChangeDetectorRef, private authService: AuthService) {
    this.collectForm = this.fb.group({
      studentId: ['', Validators.required],
      amountPaid: [0, [Validators.required, Validators.min(1)]],
      paymentMode: ['Cash', Validators.required],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole() || '';
    
    if (this.userRole === 'Parent') {
      this.activeTab = 'pay-online';
      this.loadParentChildren();
    } else {
      this.loadDashboardStats();
      this.loadPendingReport();
      this.loadStudents();
    }
  }

  switchTab(tab: 'dashboard' | 'collect' | 'history' | 'pay-online') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (tab === 'dashboard') {
      this.loadDashboardStats();
      this.loadPendingReport();
    } else if (tab === 'history') {
      this.loadPaymentHistory();
    }
  }

  // --- Parent Pay Online Logic ---
  loadParentChildren() {
    this.isLoading = true;
    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students/MyChildren').subscribe({
      next: (data) => {
        this.parentChildren = data;
        if (data.length > 0) {
          this.onParentStudentSelect(data[0].id);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onParentStudentSelect(id: number) {
    this.selectedStudent = this.parentChildren.find(s => s.id === id) || null;
    this.pendingFeeDetails = null;
    this.collectForm.patchValue({ studentId: id, amountPaid: 0, paymentMode: 'UPI', remarks: 'Online Payment' });
    this.errorMessage = '';

    if (this.selectedStudent) {
      this.http.get<any>(`https://erpschoolapi.onrender.com/api/Fees/Pending/Student/${id}`).subscribe({
        next: (data) => {
          this.pendingFeeDetails = data;
          if (data.pendingFee === 0) {
            this.errorMessage = 'No pending fees for this student.';
          } else {
            this.collectForm.patchValue({ amountPaid: data.pendingFee });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load pending fee details.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onPayOnlineSubmit() {
    if (this.collectForm.invalid || !this.selectedStudent) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    // Simulated payment gateway delay
    setTimeout(() => {
      const payload = this.collectForm.value;
      payload.receiptNumber = 'TBD';
      
      this.http.post<FeePayment>('https://erpschoolapi.onrender.com/api/Fees/Payment', payload).subscribe({
        next: (response) => {
          this.successMessage = 'Payment successful! Receipt generated.';
          this.isSubmitting = false;
          response.student = this.selectedStudent!;
          this.currentReceipt = response;
          this.showReceiptModal = true; 
          this.onParentStudentSelect(this.selectedStudent!.id); // reload balance
        },
        error: (err) => {
          this.errorMessage = err.error?.Message || 'Payment failed.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }, 1500);
  }

  // --- Dashboard Data ---

  loadDashboardStats() {
    const endpoint = this.userRole === 'Parent' 
      ? 'https://erpschoolapi.onrender.com/api/Fees/Parent/DashboardStats'
      : 'https://erpschoolapi.onrender.com/api/Fees/DashboardStats';
      
    this.http.get<any>(endpoint).subscribe({
      next: (data) => {
        this.dashboardStats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  loadPendingReport() {
    this.isLoading = true;
    const endpoint = this.userRole === 'Parent' 
      ? 'https://erpschoolapi.onrender.com/api/Fees/Parent/PendingReport'
      : 'https://erpschoolapi.onrender.com/api/Fees/PendingReport';
      
    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        this.pendingReport = data;
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

  // --- Payment History ---

  loadPaymentHistory() {
    this.isLoading = true;
    const endpoint = this.userRole === 'Parent' 
      ? 'https://erpschoolapi.onrender.com/api/Fees/Parent/Payment'
      : 'https://erpschoolapi.onrender.com/api/Fees/Payment';
      
    this.http.get<FeePayment[]>(endpoint).subscribe({
      next: (data) => {
        this.allPayments = data;
        this.applyHistoryFilter();
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

  onSearchHistory(event: any) {
    this.searchHistoryTerm = event.target.value.toLowerCase();
    this.applyHistoryFilter();
  }

  applyHistoryFilter() {
    if (!this.searchHistoryTerm) {
      this.filteredPayments = [...this.allPayments];
    } else {
      this.filteredPayments = this.allPayments.filter(p => 
        p.receiptNumber?.toLowerCase().includes(this.searchHistoryTerm) ||
        (p.student?.firstName + ' ' + p.student?.lastName).toLowerCase().includes(this.searchHistoryTerm) ||
        p.paymentMode.toLowerCase().includes(this.searchHistoryTerm)
      );
    }
    this.cdr.detectChanges();
  }

  deletePayment(id: number) {
    if (confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      this.http.delete(`https://erpschoolapi.onrender.com/api/Fees/Payment/${id}`).subscribe({
        next: () => {
          this.successMessage = 'Payment deleted successfully.';
          this.loadPaymentHistory();
        },
        error: (err) => {
          this.errorMessage = 'Failed to delete payment.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  openReceipt(payment: FeePayment) {
    this.currentReceipt = payment;
    this.showReceiptModal = true;
    this.cdr.detectChanges();
  }

  closeReceipt() {
    this.showReceiptModal = false;
    this.currentReceipt = null;
    this.cdr.detectChanges();
  }

  printReceipt() {
    window.print();
  }

  // --- Collect Fee ---

  loadStudents() {
    this.http.get<Student[]>('https://erpschoolapi.onrender.com/api/Students').subscribe({
      next: (data) => {
        this.students = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  onStudentSelect(event: any) {
    const id = parseInt(event.target.value, 10);
    this.selectedStudent = this.students.find(s => s.id === id) || null;
    this.pendingFeeDetails = null;
    this.collectForm.patchValue({ studentId: id, amountPaid: 0, remarks: '' });
    this.errorMessage = '';

    if (this.selectedStudent) {
      this.http.get<any>(`https://erpschoolapi.onrender.com/api/Fees/Pending/Student/${id}`).subscribe({
        next: (data) => {
          this.pendingFeeDetails = data;
          if (data.pendingFee === 0) {
            this.errorMessage = 'This student has no pending fees for the current structure.';
          } else {
            // Auto fill remaining amount
            this.collectForm.patchValue({ amountPaid: data.pendingFee });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load pending fee details.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCollectSubmit() {
    if (this.collectForm.invalid || !this.selectedStudent) {
      this.collectForm.markAllAsTouched();
      return;
    }

    if (this.pendingFeeDetails && this.collectForm.value.amountPaid > this.pendingFeeDetails.pendingFee) {
       this.errorMessage = `Amount cannot exceed the pending fee of ₹${this.pendingFeeDetails.pendingFee}`;
       return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const payload = this.collectForm.value;
    payload.receiptNumber = 'TBD'; // Dummy value to pass [Required] backend validation, backend overwrites this
    
    this.http.post<FeePayment>('https://erpschoolapi.onrender.com/api/Fees/Payment', payload).subscribe({
      next: (response) => {
        this.successMessage = 'Payment collected successfully!';
        this.isSubmitting = false;
        
        // Prepare receipt
        response.student = this.selectedStudent!;
        this.currentReceipt = response;
        this.showReceiptModal = false; // Disabled auto-popup as requested
        
        // Reset form
        this.collectForm.reset({ paymentMode: 'Cash', amountPaid: 0 });
        this.selectedStudent = null;
        this.pendingFeeDetails = null;
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.Message || 'Failed to collect payment.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
