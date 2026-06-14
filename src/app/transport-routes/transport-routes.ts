import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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

  constructor(private transportService: TransportService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes() {
    this.isLoading = true;
    this.transportService.getRoutes().subscribe({
      next: (data) => {
        this.routes = data;
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

  editRoute(route: TransportRoute) {
    this.newRoute = { ...route };
    this.showModal = true;
  }

  deleteRoute(id: number | undefined) {
    if (!id) return;
    if (confirm('Are you sure you want to delete this route?')) {
      this.transportService.deleteRoute(id).subscribe({
        next: () => {
          this.loadRoutes();
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete route');
        }
      });
    }
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
    if (this.newRoute.id) {
      this.transportService.updateRoute(this.newRoute.id, this.newRoute).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.showModal = false;
          this.loadRoutes();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          alert('Failed to update route');
        }
      });
    } else {
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
}
