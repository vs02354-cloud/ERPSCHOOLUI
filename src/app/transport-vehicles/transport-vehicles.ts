import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, Vehicle, TransportRoute } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transport-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-vehicles.html',
  styleUrls: ['./transport-vehicles.css']
})
export class TransportVehicles implements OnInit {
  vehicles: Vehicle[] = [];
  availableRoutes: TransportRoute[] = [];
  availableDrivers: any[] = [];
  isLoading = true;
  isSubmitting = false;
  showModal = false;

  newVehicle: Vehicle = {
    vehicleNumber: '',
    vehicleModel: '',
    vehicleType: 'Bus',
    capacity: 40,
    registrationNumber: '',
    isActive: true
  };

  constructor(private transportService: TransportService, private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadVehicles();
    this.loadRoutesAndDrivers();
  }

  loadRoutesAndDrivers() {
    this.transportService.getRoutes().subscribe(res => this.availableRoutes = res);
    this.http.get<any>('http://localhost:5120/api/HR/Employees?searchTerm=Driver&pageSize=100').subscribe(res => {
      if (res && res.items) {
        this.availableDrivers = res.items.map((item: any) => item.employee);
      }
    });
  }

  loadVehicles() {
    this.isLoading = true;
    this.transportService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
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
    this.newVehicle = {
      vehicleNumber: '',
      vehicleModel: '',
      vehicleType: 'Bus',
      capacity: 40,
      registrationNumber: '',
      isActive: true,
      assignedRouteId: null,
      driverEmployeeId: null
    } as any;
    this.showModal = true;
  }

  editVehicle(vehicle: Vehicle) {
    this.newVehicle = { ...vehicle };
    this.showModal = true;
  }

  deleteVehicle(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.transportService.deleteVehicle(id).subscribe({
        next: () => {
          this.loadVehicles();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete vehicle');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  saveVehicle() {
    if (!this.newVehicle.vehicleNumber || !this.newVehicle.vehicleModel || !this.newVehicle.registrationNumber) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    if (this.newVehicle.id) {
      this.transportService.updateVehicle(this.newVehicle.id, this.newVehicle).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.showModal = false;
          this.loadVehicles();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Failed to update vehicle');
        }
      });
    } else {
      this.transportService.addVehicle(this.newVehicle).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.showModal = false;
          this.loadVehicles();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Failed to save vehicle');
        }
      });
    }
  }
}
