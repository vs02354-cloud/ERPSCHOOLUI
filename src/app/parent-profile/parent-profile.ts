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
    this.transportService.getMyGatePasses().subscribe({
      next: (passes: TransportGatePass[]) => {
        // Get the active pass or the first one
        this.gatePass = passes && passes.length > 0 ? (passes.find(p => p.isActive) || passes[0]) : null;
        this.isLoadingTransport = false;
      },
      error: (err: any) => {
        this.gatePass = null;
        this.isLoadingTransport = false;
        // 404 is expected if they don't have transport
      }
    });
  }
}
