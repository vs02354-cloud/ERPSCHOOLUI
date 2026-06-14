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
}
