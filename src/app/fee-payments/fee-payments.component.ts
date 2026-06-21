import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../services/language.service';

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
  remarks?: string;
}

@Component({
  selector: 'app-fee-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './fee-payments.component.html',
  styleUrls: []
})
export class FeePaymentsComponent implements OnInit {
  activeTab: 'dashboard' | 'collect' | 'history' | 'pay-online' = 'dashboard';
  
  // Dashboard & Reports
  dashboardStats: any = null;
  allPendingReport: any[] = [];
  pendingReport: any[] = [];
  searchPendingTerm = '';
  
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
      remarks: [''],
      includesTransportFee: [false]
    });

    this.collectForm.get('includesTransportFee')?.valueChanges.subscribe(includes => {
      if (this.pendingFeeDetails) {
        const baseAmount = this.pendingFeeDetails.pendingFee;
        const transportAmount = this.pendingFeeDetails.transportFee || 0;
        
        if (includes) {
          this.collectForm.patchValue({ amountPaid: baseAmount + transportAmount }, { emitEvent: false });
        } else {
          this.collectForm.patchValue({ amountPaid: baseAmount }, { emitEvent: false });
        }
      }
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

  onParentStudentSelect(id: number | string) {
    const studentId = typeof id === 'string' ? parseInt(id, 10) : id;
    this.selectedStudent = this.parentChildren.find(s => s.id === studentId) || null;
    this.pendingFeeDetails = null;
    this.collectForm.patchValue({ studentId: studentId, amountPaid: 0, includesTransportFee: false, paymentMode: 'UPI', remarks: 'Online Payment' });
    this.errorMessage = '';

    if (this.selectedStudent) {
      this.http.get<any>(`https://erpschoolapi.onrender.com/api/Fees/Parent/Pending/Student/${studentId}`).subscribe({
        next: (data) => {
          this.pendingFeeDetails = data;
          if (data.pendingFee === 0) {
            this.errorMessage = 'No pending fees for this student.';
          } else {
            this.collectForm.patchValue({ amountPaid: data.pendingFee, includesTransportFee: false });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load pending fee details via API', err);
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

    const formValues = this.collectForm.value;
    const isTransportIncluded = formValues.includesTransportFee;
    const transportAmount = isTransportIncluded && this.pendingFeeDetails?.transportFee ? this.pendingFeeDetails.transportFee : 0;
    
    // Total pending could be just academic, or academic + transport if transport is ticked.
    const expectedMaxPaid = this.pendingFeeDetails.pendingFee + transportAmount;

    if (this.pendingFeeDetails && formValues.amountPaid > expectedMaxPaid) {
       this.errorMessage = `Amount cannot exceed the pending fee + transport (₹${expectedMaxPaid})`;
       return;
    }
    
    if (isTransportIncluded && formValues.amountPaid < transportAmount) {
       this.errorMessage = `Amount must be at least ₹${transportAmount} to cover the transport fee.`;
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
        this.allPendingReport = data;
        this.applyPendingFilter();
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

  onSearchPending(event: any) {
    this.searchPendingTerm = event.target.value.toLowerCase();
    this.applyPendingFilter();
  }

  applyPendingFilter() {
    if (!this.searchPendingTerm) {
      this.pendingReport = [...this.allPendingReport];
    } else {
      this.pendingReport = this.allPendingReport.filter(r => 
        (r.studentName && r.studentName.toLowerCase().includes(this.searchPendingTerm)) ||
        (r.class && r.class.toLowerCase().includes(this.searchPendingTerm)) ||
        (r.section && r.section.toLowerCase().includes(this.searchPendingTerm))
      );
    }
    this.cdr.detectChanges();
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
    this.collectForm.patchValue({ studentId: id, amountPaid: 0, remarks: '', includesTransportFee: false });
    this.errorMessage = '';

    if (this.selectedStudent) {
      this.http.get<any>(`https://erpschoolapi.onrender.com/api/Fees/Pending/Student/${id}`).subscribe({
        next: (data) => {
          this.pendingFeeDetails = data;
          if (data.pendingFee === 0) {
            this.errorMessage = 'This student has no pending fees for the current structure.';
          } else {
            // Auto fill remaining amount
            this.collectForm.patchValue({ amountPaid: data.pendingFee, includesTransportFee: false });
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

    const formValues = this.collectForm.value;
    const isTransportIncluded = formValues.includesTransportFee;
    const transportAmount = isTransportIncluded && this.pendingFeeDetails?.transportFee ? this.pendingFeeDetails.transportFee : 0;
    
    // Total pending could be just academic, or academic + transport if transport is ticked.
    const expectedMaxPaid = this.pendingFeeDetails.pendingFee + transportAmount;

    if (this.pendingFeeDetails && formValues.amountPaid > expectedMaxPaid) {
       this.errorMessage = `Amount cannot exceed the pending fee + transport (₹${expectedMaxPaid})`;
       return;
    }
    
    if (isTransportIncluded && formValues.amountPaid < transportAmount) {
       this.errorMessage = `Amount must be at least ₹${transportAmount} to cover the transport fee.`;
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
        this.collectForm.reset({ paymentMode: 'Cash', amountPaid: 0, includesTransportFee: false });
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
