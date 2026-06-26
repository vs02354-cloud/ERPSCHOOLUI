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
  classes: string[] = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'Alumni'];
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
