import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportRoute, TransportRouteStop } from '../services/transport.service';
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
  showStopsModal = false;
  selectedRouteForStops: TransportRoute | null = null;
  isSubmittingStop = false;

  newStop: TransportRouteStop = {
    stopName: '',
    sequence: 1,
    distanceFromStart: 0,
    stopFare: 0,
    isActive: true
  };

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

  // --- Route Stops Logic ---
  openStopsModal(route: TransportRoute) {
    this.selectedRouteForStops = route;
    this.newStop = { stopName: '', sequence: (route.routeStops?.length || 0) + 1, distanceFromStart: 0, stopFare: route.routeFare, isActive: true };
    this.showStopsModal = true;
  }

  closeStopsModal() {
    this.showStopsModal = false;
    this.selectedRouteForStops = null;
  }

  addStop() {
    if (!this.selectedRouteForStops?.id || !this.newStop.stopName) {
      alert('Please enter a stop name.');
      return;
    }
    this.isSubmittingStop = true;
    this.newStop.routeId = this.selectedRouteForStops.id;
    
    this.transportService.addRouteStop(this.selectedRouteForStops.id, this.newStop).subscribe({
      next: () => {
        this.isSubmittingStop = false;
        this.newStop = { stopName: '', sequence: this.newStop.sequence + 1, distanceFromStart: 0, stopFare: this.selectedRouteForStops!.routeFare, isActive: true };
        this.loadRoutes(); // Reload routes to get updated stops
        
        // Wait for routes to load and update selectedRouteForStops reference so modal list updates
        setTimeout(() => {
            if (this.selectedRouteForStops?.id) {
                this.selectedRouteForStops = this.routes.find(r => r.id === this.selectedRouteForStops!.id) || null;
            }
        }, 500);
      },
      error: (err) => {
        console.error(err);
        this.isSubmittingStop = false;
        alert('Failed to add route stop');
      }
    });
  }

  deleteStop(stopId: number | undefined) {
    if (!stopId || !this.selectedRouteForStops?.id) return;
    
    if (confirm('Are you sure you want to delete this stop?')) {
      this.transportService.deleteRouteStop(this.selectedRouteForStops.id, stopId).subscribe({
        next: () => {
          this.loadRoutes();
          setTimeout(() => {
            if (this.selectedRouteForStops?.id) {
                this.selectedRouteForStops = this.routes.find(r => r.id === this.selectedRouteForStops!.id) || null;
            }
          }, 500);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to delete route stop');
        }
      });
    }
  }
}
