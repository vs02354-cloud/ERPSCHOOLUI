import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  // Forgot Password State
  showForgotModal = signal(false);
  forgotStep = signal(1); // 1 = Email, 2 = OTP & New Password
  forgotEmail = signal('');
  forgotOtp = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  forgotIsSubmitting = signal(false);
  forgotErrorMessage = signal('');
  forgotSuccessMessage = signal('');

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set('');
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set('Invalid email or password');
          console.error(err);
        }
      });
    }
  }

  openForgotModal(event: Event) {
    event.preventDefault();
    this.showForgotModal.set(true);
    this.forgotStep.set(1);
    this.forgotEmail.set('');
    this.forgotOtp.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.forgotErrorMessage.set('');
    this.forgotSuccessMessage.set('');
  }

  closeForgotModal() {
    this.showForgotModal.set(false);
  }

  requestOtp() {
    if (!this.forgotEmail()) {
      this.forgotErrorMessage.set('Please enter your email.');
      return;
    }
    this.forgotIsSubmitting.set(true);
    this.forgotErrorMessage.set('');
    this.forgotSuccessMessage.set('');

    this.authService.forgotPassword({ email: this.forgotEmail() }).subscribe({
      next: (res: any) => {
        this.forgotIsSubmitting.set(false);
        this.forgotSuccessMessage.set(res.message || 'OTP sent successfully.');
        this.forgotStep.set(2);
      },
      error: (err) => {
        this.forgotIsSubmitting.set(false);
        this.forgotErrorMessage.set('Failed to send OTP. Please try again.');
        console.error(err);
      }
    });
  }

  resetPassword() {
    if (!this.forgotOtp() || !this.newPassword() || !this.confirmPassword()) {
      this.forgotErrorMessage.set('Please fill all fields.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.forgotErrorMessage.set('Passwords do not match.');
      return;
    }

    this.forgotIsSubmitting.set(true);
    this.forgotErrorMessage.set('');
    this.forgotSuccessMessage.set('');

    const payload = {
      email: this.forgotEmail(),
      otp: this.forgotOtp(),
      newPassword: this.newPassword()
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.forgotIsSubmitting.set(false);
        this.forgotSuccessMessage.set(res.message || 'Password reset successfully. You can now login.');
        setTimeout(() => {
          this.closeForgotModal();
        }, 3000);
      },
      error: (err) => {
        this.forgotIsSubmitting.set(false);
        this.forgotErrorMessage.set(err.error?.message || err.error || 'Failed to reset password.');
        console.error(err);
      }
    });
  }
}
