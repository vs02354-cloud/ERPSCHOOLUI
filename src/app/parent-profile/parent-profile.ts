import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TransportService, TransportGatePass } from '../services/transport.service';

@Component({
  selector: 'app-parent-profile',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './parent-profile.html',
  styleUrls: ['./parent-profile.css'],
})
export class ParentProfile implements OnInit {
  gatePass: TransportGatePass | null = null;
  isLoadingTransport = true;

  constructor(private transportService: TransportService) {}

  ngOnInit(): void {
    this.loadTransportDetails();
  }

  loadTransportDetails() {
    this.transportService.getMyGatePass().subscribe({
      next: (pass) => {
        this.gatePass = pass;
        this.isLoadingTransport = false;
      },
      error: (err) => {
        this.gatePass = null;
        this.isLoadingTransport = false;
        // 404 is expected if they don't have transport
      }
    });
  }
}
