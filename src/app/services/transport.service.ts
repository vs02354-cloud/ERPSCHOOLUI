import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TransportRouteStop {
    id?: number;
    routeId?: number;
    stopName: string;
    sequence: number;
    estimatedArrivalTime?: string;
    distanceFromStart: number;
    stopFare: number;
    isActive: boolean;
}

export interface TransportRoute {
    id?: number;
    routeName: string;
    routeCode: string;
    startPoint: string;
    endPoint: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
    routeFare: number;
    routeStops?: TransportRouteStop[];
    vehicles?: any[];
}

export interface Vehicle {
    id?: number;
    vehicleNumber: string;
    vehicleModel: string;
    vehicleType: string;
    capacity: number;
    registrationNumber: string;
    insuranceExpiry?: string;
    fitnessExpiry?: string;
    permitDetails?: string;
    pollutionExpiry?: string;
    driverEmployeeId?: number;
    attendantEmployeeId?: number;
    assignedRouteId?: number;
    isActive: boolean;
    driver?: any;
    attendant?: any;
    assignedRoute?: TransportRoute;
}

export interface TransportGatePass {
    id?: number;
    studentId: number;
    routeId: number;
    vehicleId: number;
    qrCodeData: string;
    validUntil: string;
    isActive: boolean;
    issueDate: string;
    student?: any;
    route?: TransportRoute;
    vehicle?: Vehicle;
}

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // --- Routes ---
  getRoutes(): Observable<TransportRoute[]> {
    return this.http.get<TransportRoute[]>(`${this.apiUrl}/TransportRoutes`);
  }

  getRoute(id: number): Observable<TransportRoute> {
    return this.http.get<TransportRoute>(`${this.apiUrl}/TransportRoutes/${id}`);
  }

  addRoute(route: TransportRoute): Observable<TransportRoute> {
    return this.http.post<TransportRoute>(`${this.apiUrl}/TransportRoutes`, route);
  }

  updateRoute(id: number, route: TransportRoute): Observable<any> {
    return this.http.put(`${this.apiUrl}/TransportRoutes/${id}`, route);
  }

  deleteRoute(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/TransportRoutes/${id}`);
  }

  addRouteStop(routeId: number, stop: TransportRouteStop): Observable<TransportRouteStop> {
    return this.http.post<TransportRouteStop>(`${this.apiUrl}/TransportRoutes/${routeId}/stops`, stop);
  }

  deleteRouteStop(routeId: number, stopId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/TransportRoutes/${routeId}/stops/${stopId}`);
  }

  // --- Vehicles ---
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/Vehicles`);
  }

  getVehicle(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/Vehicles/${id}`);
  }

  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/Vehicles`, vehicle);
  }

  updateVehicle(id: number, vehicle: Vehicle): Observable<any> {
    return this.http.put(`${this.apiUrl}/Vehicles/${id}`, vehicle);
  }

  deleteVehicle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Vehicles/${id}`);
  }

  // --- Gate Pass ---
  getGatePasses(): Observable<TransportGatePass[]> {
    return this.http.get<TransportGatePass[]>(`${this.apiUrl}/TransportGatePass`);
  }

  getMyGatePass(): Observable<TransportGatePass> {
    return this.http.get<TransportGatePass>(`${this.apiUrl}/TransportGatePass/my-gatepass`);
  }

  generateGatePass(studentId: number): Observable<TransportGatePass> {
    return this.http.post<TransportGatePass>(`${this.apiUrl}/TransportGatePass/generate/${studentId}`, {});
  }

  verifyGatePass(qrCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/TransportGatePass/verify/${qrCode}`);
  }
}
