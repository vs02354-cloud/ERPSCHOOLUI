import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, Vehicle } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-transport-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-vehicles.html',
  styleUrls: ['./transport-vehicles.css']
})
export class TransportVehicles implements OnInit {
  vehicles: Vehicle[] = [];
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

  constructor(private transportService: TransportService) { }

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading = true;
    this.transportService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
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
      isActive: true
    };
    this.showModal = true;
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
