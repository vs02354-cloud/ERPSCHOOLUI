import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-issued-admit-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './issued-admit-cards.component.html',
  styleUrls: []
})
export class IssuedAdmitCardsComponent implements OnInit {
  students: any[] = [];
  isLoading = false;
  errorMessage = '';

  classes: string[] = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  selectedClass: string = '';

  // For Printing
  studentToPrint: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Optionally load all issued cards initially, or wait for class selection
    this.loadIssuedCards();
  }

  loadIssuedCards() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any[]>('https://erpschoolapi.onrender.com/api/Students').subscribe({
      next: (data) => {
        // Filter students where IsAdmitCardIssued is true
        let filtered = data.filter(s => s.isAdmitCardIssued);
        
        if (this.selectedClass) {
          filtered = filtered.filter(s => s.currentClass === this.selectedClass);
        }
        
        this.students = filtered;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.errorMessage = 'Failed to load issued admit cards. Please check your connection.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  printAdmitCard(student: any) {
    this.studentToPrint = student;
    this.cdr.detectChanges();
    
    // Give Angular a tick to render the hidden print area, then print
    setTimeout(() => {
      window.print();
    }, 100);
  }
}
