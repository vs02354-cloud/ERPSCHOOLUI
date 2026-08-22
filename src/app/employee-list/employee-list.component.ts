import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../services/language.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrModule, TranslatePipe],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  searchTerm: string = '';
  
  userRole: string | null = null;
  canEdit: boolean = false;
  canDelete: boolean = false;

  showEditModal: boolean = false;
  editingEmployee: any = null;
  saving: boolean = false;
  
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.canEdit = ['Admin', 'Super Admin', 'School Admin', 'Principal'].includes(this.userRole || '');
    this.canDelete = ['Admin', 'Super Admin', 'School Admin'].includes(this.userRole || '');

    this.loadEmployees();
  }

  loadEmployees() {
    let url = `http://localhost:5120/api/HR/Employees?page=${this.page}&pageSize=${this.pageSize}`;
    if (this.searchTerm) {
      url += `&searchTerm=${encodeURIComponent(this.searchTerm)}`;
    }

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.employees = res.items;
        this.totalCount = res.totalCount;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.page = 1;
    this.loadEmployees();
  }

  nextPage() {
    if (this.page * this.pageSize < this.totalCount) {
      this.page++;
      this.loadEmployees();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadEmployees();
    }
  }

  openEditModal(empDto: any) {
    if (!this.canEdit) return;
    // Deep clone to avoid two-way binding affecting the list directly before save
    this.editingEmployee = JSON.parse(JSON.stringify(empDto));
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingEmployee = null;
  }

  saveEmployee() {
    if (!this.editingEmployee) return;
    this.saving = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.http.put(`http://localhost:5120/api/HR/Employee/${this.editingEmployee.employee.id}`, this.editingEmployee).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Employee record updated successfully.';
        
        // Immediately update local array to reflect changes instantly
        const index = this.employees.findIndex(e => e.employee.id === this.editingEmployee.employee.id);
        if (index !== -1) {
          this.employees[index] = { ...this.editingEmployee };
        }

        this.closeEditModal();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Failed to update employee', err);
        this.saving = false;
        this.errorMessage = err.error?.message || 'Failed to update employee record.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteEmployee(id: number) {
    if (!this.canDelete) return;
    if (confirm('Are you sure you want to delete this employee record?')) {
      this.http.delete(`http://localhost:5120/api/HR/Employee/${id}`).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => console.error('Failed to delete employee', err)
      });
    }
  }
}
