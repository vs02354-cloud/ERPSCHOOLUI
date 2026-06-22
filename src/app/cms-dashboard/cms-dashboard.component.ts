import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CmsService, HomePageSettings, QuickLink, SocialMediaLink } from '../services/cms.service';

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
            
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              <!-- Quick Links Management -->
              <div>
                <h2 class="text-xl font-bold mb-4">Manage Quick Links</h2>
                <div class="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                  <h3 class="font-bold text-gray-700 mb-3">{{ isEditingQuickLink ? 'Edit Link' : 'Add New Link' }}</h3>
                  <form [formGroup]="quickLinkForm" (ngSubmit)="saveQuickLink()" class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Title</label>
                        <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Display Order</label>
                        <input type="number" formControlName="displayOrder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700">URL</label>
                      <input type="text" formControlName="url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>
                    <div class="flex items-center mt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                    <div class="flex gap-2 pt-2">
                      <button type="submit" [disabled]="quickLinkForm.invalid || isSavingQuickLink" class="bg-indigo-600 text-white px-4 py-1.5 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingQuickLink ? 'Saving...' : (isEditingQuickLink ? 'Update' : 'Add') }}
                      </button>
                      <button *ngIf="isEditingQuickLink" type="button" (click)="cancelQuickLinkEdit()" class="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">URL</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of quickLinksList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{{item.title}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate max-w-xs" [title]="item.url">{{item.url}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editQuickLink(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteQuickLink(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="quickLinksList.length === 0">
                        <td colspan="4" class="py-4 text-center text-sm text-gray-500">No quick links found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Social Media Management -->
              <div>
                <h2 class="text-xl font-bold mb-4">Social Media Links</h2>
                <div class="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                  <h3 class="font-bold text-gray-700 mb-3">{{ isEditingSocialLink ? 'Edit Link' : 'Add New Link' }}</h3>
                  <form [formGroup]="socialLinkForm" (ngSubmit)="saveSocialLink()" class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Platform</label>
                        <select formControlName="platform" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-white">
                          <option value="">Select Platform</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="X">X (Twitter)</option>
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="YouTube">YouTube</option>
                        </select>
                      </div>
                      <div class="flex items-center pt-6">
                        <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                        <label class="ml-2 block text-sm text-gray-900">Active</label>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Profile URL</label>
                      <input type="text" formControlName="url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" placeholder="https://...">
                    </div>
                    
                    <div class="flex gap-2 pt-2">
                      <button type="submit" [disabled]="socialLinkForm.invalid || isSavingSocialLink" class="bg-indigo-600 text-white px-4 py-1.5 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingSocialLink ? 'Saving...' : (isEditingSocialLink ? 'Update' : 'Add') }}
                      </button>
                      <button *ngIf="isEditingSocialLink" type="button" (click)="cancelSocialLinkEdit()" class="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Platform</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of socialLinksList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          <div class="flex items-center gap-2">
                            <span class="font-bold">{{item.platform}}</span>
                            <a [href]="item.url" target="_blank" class="text-indigo-600 hover:underline text-xs">Link</a>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editSocialLink(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteSocialLink(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="socialLinksList.length === 0">
                        <td colspan="3" class="py-4 text-center text-sm text-gray-500">No social links found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

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

  quickLinksList: QuickLink[] = [];
  quickLinkForm: FormGroup;
  isEditingQuickLink = false;
  isSavingQuickLink = false;

  socialLinksList: SocialMediaLink[] = [];
  socialLinkForm: FormGroup;
  isEditingSocialLink = false;
  isSavingSocialLink = false;

  constructor(private fb: FormBuilder, private cms: CmsService, private route: ActivatedRoute) {
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

    this.quickLinkForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      url: ['', Validators.required],
      displayOrder: [0],
      isActive: [true]
    });

    this.socialLinkForm = this.fb.group({
      id: [0],
      platform: ['', Validators.required],
      url: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
        if (this.activeTab === 'quicklinks') {
          this.loadQuickLinks();
          this.loadSocialLinks();
        }
      }
    });

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

  // --- Quick Links Logic ---
  loadQuickLinks() {
    this.cms.getItems('QuickLinks').subscribe(res => this.quickLinksList = res);
  }

  editQuickLink(item: QuickLink) {
    this.isEditingQuickLink = true;
    this.quickLinkForm.patchValue(item);
  }

  cancelQuickLinkEdit() {
    this.isEditingQuickLink = false;
    this.quickLinkForm.reset({ id: 0, title: '', url: '', displayOrder: 0, isActive: true });
  }

  saveQuickLink() {
    if (this.quickLinkForm.invalid) return;
    this.isSavingQuickLink = true;
    const val = this.quickLinkForm.value;
    const req = this.isEditingQuickLink 
      ? this.cms.updateItem('QuickLinks', val.id, val)
      : this.cms.addItem('QuickLinks', val);
    
    req.subscribe({
      next: () => {
        this.isSavingQuickLink = false;
        this.cancelQuickLinkEdit();
        this.loadQuickLinks();
      },
      error: () => this.isSavingQuickLink = false
    });
  }

  deleteQuickLink(id: number) {
    if(confirm('Are you sure you want to delete this link?')) {
      this.cms.deleteItem('QuickLinks', id).subscribe(() => this.loadQuickLinks());
    }
  }

  // --- Social Media Links Logic ---
  loadSocialLinks() {
    this.cms.getItems('SocialMediaLinks').subscribe(res => this.socialLinksList = res);
  }

  editSocialLink(item: SocialMediaLink) {
    this.isEditingSocialLink = true;
    this.socialLinkForm.patchValue(item);
  }

  cancelSocialLinkEdit() {
    this.isEditingSocialLink = false;
    this.socialLinkForm.reset({ id: 0, platform: '', url: '', isActive: true });
  }

  saveSocialLink() {
    if (this.socialLinkForm.invalid) return;
    this.isSavingSocialLink = true;
    const val = this.socialLinkForm.value;
    const req = this.isEditingSocialLink 
      ? this.cms.updateItem('SocialMediaLinks', val.id, val)
      : this.cms.addItem('SocialMediaLinks', val);
    
    req.subscribe({
      next: () => {
        this.isSavingSocialLink = false;
        this.cancelSocialLinkEdit();
        this.loadSocialLinks();
      },
      error: () => this.isSavingSocialLink = false
    });
  }

  deleteSocialLink(id: number) {
    if(confirm('Are you sure you want to delete this social link?')) {
      this.cms.deleteItem('SocialMediaLinks', id).subscribe(() => this.loadSocialLinks());
    }
  }
}
