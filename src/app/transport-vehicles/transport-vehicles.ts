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
}
