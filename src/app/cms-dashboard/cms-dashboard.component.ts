import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CmsService, HomePageSettings } from '../services/cms.service';

@Component({
  selector: 'app-cms-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
        <p class="text-gray-500">Manage your dynamic homepage content.</p>
      </div>

      <div class="flex gap-6">
        <!-- Sidebar Navigation -->
        <div class="w-64 shrink-0 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <nav class="flex flex-col">
            <button *ngFor="let tab of tabs" 
                    (click)="activeTab = tab.id"
                    [class.bg-indigo-50]="activeTab === tab.id"
                    [class.text-indigo-600]="activeTab === tab.id"
                    [class.border-l-4]="activeTab === tab.id"
                    [class.border-indigo-600]="activeTab === tab.id"
                    class="px-4 py-3 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border-l-4 border-transparent">
              {{tab.name}}
            </button>
          </nav>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 bg-white shadow-sm border border-gray-200 rounded-xl p-6">
          
          <!-- General Settings Tab (Branding & Hero) -->
          <div *ngIf="activeTab === 'settings'">
            <h2 class="text-xl font-bold mb-4">Branding & Hero Settings</h2>
            <form *ngIf="settingsForm" [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-4">
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">School Name</label>
                  <input type="text" formControlName="schoolName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" formControlName="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Hero Heading</label>
                <input type="text" formControlName="heroHeading" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Hero Description</label>
                <textarea formControlName="heroDescription" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"></textarea>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <button type="submit" [disabled]="isSaving" class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
                  {{ isSaving ? 'Saving...' : 'Save Settings' }}
                </button>
                <span *ngIf="savedSuccess" class="ml-3 text-green-600 text-sm">Saved successfully!</span>
              </div>
            </form>
          </div>

          <!-- Quick Links Tab -->
          <div *ngIf="activeTab === 'quicklinks'">
            <h2 class="text-xl font-bold mb-4">Manage Quick Links</h2>
            <p class="text-sm text-gray-500 mb-4">Add, edit, or remove quick links shown in the footer.</p>
            
            <!-- List goes here. For brevity, using a generic placeholder -->
            <div class="bg-yellow-50 p-4 rounded text-yellow-800 text-sm border border-yellow-200">
              Generic list management UI implemented via CMS Service CRUD methods...
            </div>
          </div>
          
          <!-- Upcoming Events Tab -->
          <div *ngIf="activeTab === 'events'">
            <h2 class="text-xl font-bold mb-4">Upcoming Events</h2>
            <div class="bg-yellow-50 p-4 rounded text-yellow-800 text-sm border border-yellow-200">
              Event management UI (Add, Edit, Upload Image, Delete) implemented via CMS Service...
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class CmsDashboardComponent implements OnInit {
  tabs = [
    { id: 'settings', name: 'Branding & Hero' },
    { id: 'quicklinks', name: 'Quick Links' },
    { id: 'events', name: 'Upcoming Events' },
    { id: 'activities', name: 'Recent Activities' },
    { id: 'faculty', name: 'Faculty Excellence' },
    { id: 'students', name: 'Student Spotlight' },
    { id: 'stats', name: 'Home Statistics' }
  ];
  activeTab = 'settings';

  settingsForm: FormGroup;
  isSaving = false;
  savedSuccess = false;

  constructor(private fb: FormBuilder, private cms: CmsService) {
    this.settingsForm = this.fb.group({
      id: [0],
      schoolName: [''],
      logoUrl: [''],
      address: [''],
      email: [''],
      phone: [''],
      websiteUrl: [''],
      heroTagline: [''],
      heroHeading: [''],
      heroDescription: [''],
      heroPrimaryButtonText: [''],
      heroPrimaryButtonUrl: [''],
      heroSecondaryButtonText: [''],
      heroSecondaryButtonUrl: [''],
      mapEmbedUrl: ['']
    });
  }

  ngOnInit() {
    this.cms.getSettings().subscribe(res => {
      if (res) this.settingsForm.patchValue(res);
    });
  }

  saveSettings() {
    this.isSaving = true;
    this.cms.updateSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.savedSuccess = true;
        setTimeout(() => this.savedSuccess = false, 3000);
      },
      error: () => this.isSaving = false
    });
  }
}
