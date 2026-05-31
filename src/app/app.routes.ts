import { Routes } from '@angular/router';
import { AdmissionFormComponent } from './admission-form/admission-form.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { StudentsListComponent } from './students-list/students-list.component';
import { BroadcastComponent } from './broadcast/broadcast.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { FeeStructureComponent } from './fee-structure/fee-structure.component';
import { FeePaymentsComponent } from './fee-payments/fee-payments.component';

import { EmployeeListComponent } from './employee-list/employee-list.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { TransferCertificateComponent } from './transfer-certificate/transfer-certificate';
import { Home } from './home/home';
import { PublicInquiryForm } from './public-inquiry-form/public-inquiry-form';
import { InquiryDashboard } from './inquiry-dashboard/inquiry-dashboard';

import { AboutUs } from './about-us/about-us';
import { Contact } from './contact/contact';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'inquiry', component: PublicInquiryForm },
    { path: 'about', component: AboutUs },
    { path: 'contact', component: Contact },
    { 
      path: 'dashboard', 
      component: DashboardLayoutComponent,
      children: [
        { path: '', component: AdminDashboardComponent, pathMatch: 'full' },
        { path: 'employees', component: EmployeeListComponent },
        { path: 'students', component: StudentsListComponent },
        { path: 'admission', component: AdmissionFormComponent },
        { path: 'students/edit/:id', component: AdmissionFormComponent },
        { path: 'broadcast', component: BroadcastComponent },
        { path: 'attendance', component: AttendanceComponent },
        { path: 'attendance-report', component: AttendanceReportComponent },
        { path: 'fee-structure', component: FeeStructureComponent },
        { path: 'fee-payments', component: FeePaymentsComponent },
        { path: 'tc', component: TransferCertificateComponent },
        { path: 'inquiries', component: InquiryDashboard }
      ]
    },
    { path: '', component: Home, pathMatch: 'full' }
];
