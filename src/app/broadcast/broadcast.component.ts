import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './broadcast.component.html',
  styleUrls: []
})
export class BroadcastComponent {
  broadcastForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  classes: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.broadcastForm = this.fb.group({
      type: ['WhatsApp', Validators.required],
      targetAudience: ['All', Validators.required],
      targetClass: [''],
      message: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.broadcastForm.get('targetAudience')?.valueChanges.subscribe(value => {
      const targetClassControl = this.broadcastForm.get('targetClass');
      if (value === 'SpecificClass') {
        targetClassControl?.setValidators([Validators.required]);
      } else {
        targetClassControl?.clearValidators();
        targetClassControl?.setValue('');
      }
      targetClassControl?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.broadcastForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      this.http.post<any>('http://localhost:5120/api/Communication/Broadcast', this.broadcastForm.value).subscribe({
        next: (response) => {
          this.successMessage = `Successfully processed! Sent ${response.count} messages via ${this.broadcastForm.value.type}.`;
          this.isSubmitting = false;
          this.broadcastForm.reset({ type: 'WhatsApp' });
        },
        error: (error) => {
          this.errorMessage = `Broadcast failed. Details: ${error.message}`;
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.broadcastForm.controls).forEach(key => {
        this.broadcastForm.get(key)?.markAsTouched();
      });
    }
  }
}
