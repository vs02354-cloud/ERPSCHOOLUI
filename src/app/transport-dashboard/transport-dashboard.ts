import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransportService, Vehicle, TransportRoute } from '../services/transport.service';
import { LanguageService } from '../services/language.service';
import { LanguagePipe } from '../services/language.pipe';

@Component({
  selector: 'app-transport-dashboard',
  standalone: true,
  imports: [CommonModule, LanguagePipe],
  templateUrl: './transport-dashboard.html',
  styleUrls: ['./transport-dashboard.css']
})
export class TransportDashboard implements OnInit {
  vehicles: Vehicle[] = [];
  routes: TransportRoute[] = [];
  isLoading = true;

  activeVehicles = 0;
  totalCapacity = 0;
  activeDrivers = 0;

  constructor(
    private transportService: TransportService,
    public languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Fetch routes and vehicles
    this.transportService.getRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        
        this.transportService.getVehicles().subscribe({
          next: (vData) => {
            this.vehicles = vData;
            this.calculateMetrics();
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching vehicles', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching routes', err);
        this.isLoading = false;
      }
    });
  }

  calculateMetrics() {
    this.activeVehicles = this.vehicles.filter(v => v.isActive).length;
    this.totalCapacity = this.vehicles.reduce((sum, v) => sum + (v.isActive ? v.capacity : 0), 0);
    this.activeDrivers = this.vehicles.filter(v => v.driverEmployeeId && v.isActive).length;
  }
}
