import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrls: []
})
export class StudentsListComponent implements OnInit {
  students: any[] = [];
  isLoading = true;
  errorMessage = '';

  searchTerm: string = '';
  filterClass: string = '';
  filterSection: string = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents() {
    this.isLoading = true;
    this.http.get<any[]>('http://localhost:5120/api/Students').subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch students', err);
        this.errorMessage = 'Failed to load students. Please check your connection.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredStudents() {
    return this.students.filter(student => {
      const matchSearch = !this.searchTerm || 
        student.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        student.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
        
      const matchClass = !this.filterClass || student.currentClass === this.filterClass;
      const matchSection = !this.filterSection || student.section === this.filterSection;

      return matchSearch && matchClass && matchSection;
    });
  }

  editStudent(id: number) {
    this.router.navigate(['/dashboard/students/edit', id]);
  }
}
