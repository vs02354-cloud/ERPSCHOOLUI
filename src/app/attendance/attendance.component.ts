import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  currentClass: string;
  section: string;
  admissionNumber: string;
}

interface AttendanceRecord {
  studentId: number;
  studentName: string;
  admissionNumber: string;
  status: string;
  remarks: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: []
})
export class AttendanceComponent implements OnInit {
  selectedDate: string = new Date().toISOString().split('T')[0];
  maxDate: string = new Date().toISOString().split('T')[0];
  selectedClass: string = '';
  selectedSection: string = '';
  
  classes: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  sections: string[] = ['A', 'B', 'C', 'D'];

  attendanceRecords: AttendanceRecord[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  loadStudents() {
    if (!this.selectedClass || !this.selectedSection || !this.selectedDate) {
      this.errorMessage = 'Please select Date, Class, and Section.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.attendanceRecords = [];
    this.cdr.detectChanges();

    // 1. Fetch Students
    this.http.get<Student[]>('http://localhost:5120/api/Students').subscribe({
      next: (students) => {
        // Filter students by class and section
        const filteredStudents = students.filter(s => s.currentClass === this.selectedClass && s.section === this.selectedSection);
        
        if (filteredStudents.length === 0) {
          this.errorMessage = 'No students found for this Class and Section.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // 2. Fetch Attendance for this Date
        this.http.get<any[]>(`http://localhost:5120/api/Attendance/ByDate/${this.selectedDate}`).subscribe({
          next: (attendances) => {
            this.attendanceRecords = filteredStudents.map(student => {
              const existingAtt = attendances.find(a => a.studentId === student.id);
              return {
                studentId: student.id,
                studentName: `${student.firstName} ${student.lastName}`,
                admissionNumber: student.admissionNumber,
                status: existingAtt ? existingAtt.status : 'Present', // Default to Present
                remarks: existingAtt ? existingAtt.remarks : ''
              };
            });
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error fetching attendance', err);
            this.errorMessage = 'Failed to load existing attendance data.';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching students', err);
        this.errorMessage = 'Failed to load students.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveAttendance() {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const payload = this.attendanceRecords.map(record => ({
      studentId: record.studentId,
      date: new Date(this.selectedDate).toISOString(),
      status: record.status,
      remarks: record.remarks
    }));

    this.http.post('http://localhost:5120/api/Attendance/MarkBulk', payload).subscribe({
      next: () => {
        this.successMessage = 'Attendance saved successfully!';
        this.isSaving = false;
        this.cdr.detectChanges();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving attendance', err);
        this.errorMessage = 'Failed to save attendance.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  setStatus(record: AttendanceRecord, status: string) {
    record.status = status;
  }
}
