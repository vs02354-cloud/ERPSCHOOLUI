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
import { TcApplyComponent } from './tc-apply/tc-apply.component';
import { TcReportsComponent } from './tc-reports/tc-reports.component';
import { Home } from './home/home';
import { PublicInquiryForm } from './public-inquiry-form/public-inquiry-form';
import { InquiryDashboard } from './inquiry-dashboard/inquiry-dashboard';

import { AssignmentsComponent } from './assignments/assignments.component';
import { CreateAssignmentComponent } from './assignments/create-assignment.component';
import { AssignmentDetailsComponent } from './assignments/assignment-details.component';

import { AboutUs } from './about-us/about-us';
import { Contact } from './contact/contact';
import { TransportDrivers } from './transport-drivers/transport-drivers';

import { Leave } from './leave/leave';
import { ParentProfile } from './parent-profile/parent-profile';
import { Notifications } from './notifications/notifications';
import { SendNotificationComponent } from './send-notification/send-notification.component';
import { CommissionManagementComponent } from './commission-management/commission-management';

import { TransportDashboard } from './transport-dashboard/transport-dashboard';
import { TransportRoutes } from './transport-routes/transport-routes';
import { TransportVehicles } from './transport-vehicles/transport-vehicles';
import { TransportGatepass } from './transport-gatepass/transport-gatepass';

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
        { path: 'tc/apply', component: TcApplyComponent },
        { path: 'tc/reports', component: TcReportsComponent },
        { path: 'inquiries', component: InquiryDashboard },
        { path: 'assignments', component: AssignmentsComponent },
        { path: 'assignments/create', component: CreateAssignmentComponent },
        { path: 'assignments/:id', component: AssignmentDetailsComponent },
        { path: 'leave', component: Leave },
        { path: 'profile', component: ParentProfile },
        { path: 'notifications', component: Notifications },
        { path: 'send-notification', component: SendNotificationComponent },
        { path: 'commissions', component: CommissionManagementComponent },
        
        { path: 'transport/dashboard', component: TransportDashboard },
        { path: 'transport/routes', component: TransportRoutes },
        { path: 'transport/vehicles', component: TransportVehicles },
        { path: 'transport/gatepass', component: TransportGatepass },
        { path: 'transport/drivers', component: TransportDrivers }
      ]
    },
    { path: '', component: Home, pathMatch: 'full' }
];
