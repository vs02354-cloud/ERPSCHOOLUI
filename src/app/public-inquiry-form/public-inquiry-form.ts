import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InquiryService } from '../services/inquiry';
import { CmsService, HomePageSettings } from '../services/cms.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-public-inquiry-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FlatpickrModule],
  templateUrl: './public-inquiry-form.html',
  styleUrl: './public-inquiry-form.css'
})
export class PublicInquiryForm implements OnInit {
  private fb = inject(FormBuilder);
  private inquiryService = inject(InquiryService);
  private router = inject(Router);
  private cms = inject(CmsService);
  private cdr = inject(ChangeDetectorRef);
  public themeService = inject(ThemeService);

  inquiryForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  isMobileMenuOpen = false;
  currentLanguage: 'en' | 'hi' = 'en';
  settings: HomePageSettings | null = null;

  classes = [
    'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
    'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
  ];

  sources = ['Website', 'Walk-in', 'Social Media', 'Reference', 'Advertisement', 'Other'];

  constructor() {
    this.inquiryForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.maxLength(150)]],
      dateOfBirth: [''],
      gender: [''],
      classApplyingFor: ['', Validators.required],
      parentName: ['', [Validators.required, Validators.maxLength(150)]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      alternateMobileNo: ['', [Validators.pattern('^[0-9]{10,15}$')]],
      emailId: ['', [Validators.email]],
      currentSchool: [''],
      address: [''],
      city: [''],
      stateName: [''],
      pincode: [''],
      inquirySource: [''],
      remarks: ['']
    });
  }

  ngOnInit() {
    this.currentLanguage = (localStorage.getItem('language') as 'en' | 'hi') || 'en';
    this.cms.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
        this.cdr.detectChanges();
      }
    });
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentLanguage = select.value as 'en' | 'hi';
    localStorage.setItem('language', this.currentLanguage);
    this.cdr.detectChanges();
  }

  onSubmit() {
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.inquiryService.submitInquiry(this.inquiryForm.value).subscribe({
      next: (res) => {
        this.successMessage = `Thank you! Your inquiry has been submitted successfully. Reference No: ${res.inquiryNumber}`;
        this.inquiryForm.reset();
        this.isSubmitting = false;
        
        // Auto hide success message after 10 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 10000);
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while submitting your inquiry. Please try again later.';
        this.isSubmitting = false;
        console.error(err);
      }
    });
  }
}

