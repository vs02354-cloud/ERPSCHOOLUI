import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transport-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transport-drivers.html',
  styleUrls: ['./transport-drivers.css']
})
export class TransportDrivers implements OnInit {
  drivers: any[] = [];
  isLoading = true;
  showModal = false;
  isSubmitting = false;

  newDriver: any = {
    firstName: '',
    lastName: '',
    mobileNumber: '',
    address: '',
    drivingLicenceNumber: '',
    licenceExpiryDate: '',
    designation: 'Driver',
    employeeType: 'Non-Teaching',
    isActive: true
  };

  apiUrl = 'http://localhost:5120/api/HR';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers() {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/Employees?searchTerm=Driver&pageSize=100`).subscribe({
      next: (res) => {
        if (res && res.items) {
          this.drivers = res.items.map((item: any) => item.employee);
        } else {
          this.drivers = [];
        }
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

  openAddModal() {
    this.newDriver = {
      firstName: '',
      lastName: '',
      mobileNumber: '',
      address: '',
      drivingLicenceNumber: '',
      licenceExpiryDate: '',
      designation: 'Driver',
      employeeType: 'Non-Teaching',
      employeeCode: 'DRV-' + Math.floor(1000 + Math.random() * 9000),
      isActive: true
    };
    this.showModal = true;
  }

  editDriver(driver: any) {
    this.newDriver = { ...driver };
    if (this.newDriver.licenceExpiryDate) {
      this.newDriver.licenceExpiryDate = this.newDriver.licenceExpiryDate.split('T')[0];
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveDriver() {
    if (!this.newDriver.firstName || !this.newDriver.drivingLicenceNumber) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    
    if (this.newDriver.id) {
      const payload = { employee: this.newDriver, isActive: this.newDriver.isActive };
      this.http.put(`${this.apiUrl}/Employee/${this.newDriver.id}`, payload).subscribe({
        next: () => {
          this.loadDrivers();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.http.post(`${this.apiUrl}/Employee`, this.newDriver).subscribe({
        next: () => {
          this.loadDrivers();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteDriver(id: number) {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.http.delete(`${this.apiUrl}/Employee/${id}`).subscribe({
        next: () => {
          this.loadDrivers();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete driver');
        }
      });
    }
  }
}
