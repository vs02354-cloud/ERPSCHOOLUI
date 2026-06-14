import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportRoute } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-transport-routes',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-routes.html',
  styleUrls: ['./transport-routes.css']
})
export class TransportRoutes implements OnInit {
  routes: TransportRoute[] = [];
  isLoading = true;
  isSubmitting = false;
  showModal = false;

  newRoute: TransportRoute = {
    routeName: '',
    routeCode: '',
    startPoint: '',
    endPoint: '',
    startTime: '',
    endTime: '',
    isActive: true,
    routeFare: 0
  };

  constructor(private transportService: TransportService) { }

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes() {
    this.isLoading = true;
    this.transportService.getRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.newRoute = {
      routeName: '',
      routeCode: '',
      startPoint: '',
      endPoint: '',
      startTime: '',
      endTime: '',
      isActive: true,
      routeFare: 0
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveRoute() {
    if (!this.newRoute.routeName || !this.newRoute.routeCode || !this.newRoute.startPoint || !this.newRoute.endPoint || !this.newRoute.startTime || !this.newRoute.endTime) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    this.transportService.addRoute(this.newRoute).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showModal = false;
        this.loadRoutes();
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        alert('Failed to save route');
      }
    });
  }
}
