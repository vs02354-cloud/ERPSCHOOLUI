import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransportService, TransportGatePass } from '../services/transport.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-transport-gatepass',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './transport-gatepass.html',
  styleUrls: ['./transport-gatepass.css']
})
export class TransportGatepass implements OnInit {
  gatePasses: TransportGatePass[] = [];
  isLoading = true;

  constructor(private transportService: TransportService) { }

  ngOnInit(): void {
    this.loadGatePasses();
  }

  loadGatePasses() {
    this.isLoading = true;
    this.transportService.getGatePasses().subscribe({
      next: (data) => {
        this.gatePasses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
