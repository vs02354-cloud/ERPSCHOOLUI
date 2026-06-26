import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-promotion-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './promotion-report.html',
  styleUrls: []
})
export class PromotionReportComponent implements OnInit {
  classes: string[] = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Alumni'];
  selectedClass: string = '';
  
  reportData: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchReport();
  }

  fetchReport() {
    this.isLoading = true;
    this.errorMessage = '';
    
    let url = 'https://erpschoolapi.onrender.com/api/Promotion/Report';
    if (this.selectedClass) {
      url += `?classFilter=${encodeURIComponent(this.selectedClass)}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching report', err);
        this.errorMessage = 'Failed to load promotion report.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
