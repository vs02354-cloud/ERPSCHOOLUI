import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CmsService, HomePageSettings, QuickLink, SocialMediaLink, UpcomingEvent, RecentActivity, FacultyExcellence, StudentSpotlight, HomeStatistic, NewsTicker, Holiday } from '../services/cms.service';

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
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Manage Upcoming Events</h2>
                <p class="text-sm text-gray-500">Add, edit, or remove events displayed on the homepage.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingEvent ? 'Edit Event' : 'Add New Event' }}</h3>
                  <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Event Title <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Date <span class="text-red-500">*</span></label>
                        <input type="date" formControlName="eventDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Time</label>
                        <input type="time" formControlName="time" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Description</label>
                      <textarea formControlName="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"></textarea>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Image</label>
                      <input type="file" (change)="uploadEventImage($event)" accept="image/*" class="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                      <div *ngIf="isUploadingEventImage" class="text-xs text-indigo-600 mt-1">Uploading...</div>
                      <div *ngIf="eventForm.get('imageUrl')?.value" class="mt-2">
                        <img [src]="eventForm.get('imageUrl')?.value" class="h-20 w-auto rounded border">
                      </div>
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Publish to Homepage</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="eventForm.invalid || isSavingEvent || isUploadingEventImage" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingEvent ? 'Saving...' : (isEditingEvent ? 'Update Event' : 'Add Event') }}
                      </button>
                      <button *ngIf="isEditingEvent" type="button" (click)="cancelEventEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Event Details</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date & Time</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of eventsList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3">
                          <div class="flex items-center">
                            <div class="h-10 w-10 shrink-0">
                              <img class="h-10 w-10 rounded-lg object-cover bg-gray-100" [src]="item.imageUrl || 'assets/placeholder.jpg'" alt="">
                            </div>
                            <div class="ml-4 max-w-[200px]">
                              <div class="font-medium text-gray-900 text-sm truncate" [title]="item.title">{{item.title}}</div>
                              <div class="text-xs text-gray-500 truncate" [title]="item.description">{{item.description}}</div>
                            </div>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div class="font-medium">{{item.eventDate | date:'mediumDate'}}</div>
                          <div class="text-xs">{{item.time}}</div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Published' : 'Hidden'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editEvent(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteEvent(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="eventsList.length === 0">
                        <td colspan="4" class="py-8 text-center text-sm text-gray-500">No upcoming events found. Add one to get started.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <!-- Recent Activities Tab -->
          <div *ngIf="activeTab === 'activities'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Recent Activities</h2>
                <p class="text-sm text-gray-500">Manage photo galleries and recaps of recent school activities.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingActivity ? 'Edit Activity' : 'Add New Activity' }}</h3>
                  <form [formGroup]="activityForm" (ngSubmit)="saveActivity()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Activity Title <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Display Order</label>
                      <input type="number" formControlName="displayOrder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Description</label>
                      <textarea formControlName="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"></textarea>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Image</label>
                      <input type="file" (change)="uploadActivityImage($event)" accept="image/*" class="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                      <div *ngIf="isUploadingActivityImage" class="text-xs text-indigo-600 mt-1">Uploading...</div>
                      <div *ngIf="activityForm.get('imageUrl')?.value" class="mt-2">
                        <img [src]="activityForm.get('imageUrl')?.value" class="h-20 w-auto rounded border">
                      </div>
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Publish to Homepage</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="activityForm.invalid || isSavingActivity || isUploadingActivityImage" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingActivity ? 'Saving...' : (isEditingActivity ? 'Update Activity' : 'Add Activity') }}
                      </button>
                      <button *ngIf="isEditingActivity" type="button" (click)="cancelActivityEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Activity Details</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of activitiesList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3">
                          <div class="flex items-center">
                            <div class="h-10 w-10 shrink-0">
                              <img class="h-10 w-10 rounded-lg object-cover bg-gray-100" [src]="item.imageUrl || 'assets/placeholder.jpg'" alt="">
                            </div>
                            <div class="ml-4 max-w-[200px]">
                              <div class="font-medium text-gray-900 text-sm truncate" [title]="item.title">{{item.title}}</div>
                              <div class="text-xs text-gray-500 truncate" [title]="item.description">{{item.description}}</div>
                            </div>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Published' : 'Hidden'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editActivity(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteActivity(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="activitiesList.length === 0">
                        <td colspan="3" class="py-8 text-center text-sm text-gray-500">No recent activities found. Add one to get started.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <!-- Faculty Excellence Tab -->
          <div *ngIf="activeTab === 'faculty'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Faculty Excellence</h2>
                <p class="text-sm text-gray-500">Highlight the achievements of your top faculty members.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingFaculty ? 'Edit Faculty' : 'Add New Faculty' }}</h3>
                  <form [formGroup]="facultyForm" (ngSubmit)="saveFaculty()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Name <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Designation</label>
                        <input type="text" formControlName="designation" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Department</label>
                        <input type="text" formControlName="department" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Achievement</label>
                      <textarea formControlName="achievement" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Display Order</label>
                        <input type="number" formControlName="displayOrder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Photo</label>
                        <input type="file" (change)="uploadFacultyImage($event)" accept="image/*" class="mt-1 block w-full text-xs text-slate-500">
                      </div>
                    </div>
                    
                    <div *ngIf="isUploadingFacultyImage" class="text-xs text-indigo-600 mt-1">Uploading...</div>
                    <div *ngIf="facultyForm.get('photoUrl')?.value" class="mt-2">
                      <img [src]="facultyForm.get('photoUrl')?.value" class="h-16 w-16 object-cover rounded-full border">
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="facultyForm.invalid || isSavingFaculty || isUploadingFacultyImage" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingFaculty ? 'Saving...' : (isEditingFaculty ? 'Update Faculty' : 'Add Faculty') }}
                      </button>
                      <button *ngIf="isEditingFaculty" type="button" (click)="cancelFacultyEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Faculty Member</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of facultyList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3">
                          <div class="flex items-center">
                            <div class="h-10 w-10 shrink-0">
                              <img class="h-10 w-10 rounded-full object-cover bg-gray-100" [src]="item.photoUrl || 'assets/placeholder-user.jpg'" alt="">
                            </div>
                            <div class="ml-4 max-w-[250px]">
                              <div class="font-medium text-gray-900 text-sm truncate" [title]="item.name">{{item.name}}</div>
                              <div class="text-xs text-indigo-600 font-medium">{{item.designation}} - {{item.department}}</div>
                              <div class="text-xs text-gray-500 truncate mt-0.5" [title]="item.achievement">{{item.achievement}}</div>
                            </div>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editFaculty(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteFaculty(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="facultyList.length === 0">
                        <td colspan="3" class="py-8 text-center text-sm text-gray-500">No faculty members found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <!-- Student Spotlight Tab -->
          <div *ngIf="activeTab === 'students'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Student Spotlight</h2>
                <p class="text-sm text-gray-500">Feature exceptional students and their achievements.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingStudent ? 'Edit Student' : 'Add New Student' }}</h3>
                  <form [formGroup]="studentForm" (ngSubmit)="saveStudent()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Student Name <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Class/Grade</label>
                        <input type="text" formControlName="class" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Display Order</label>
                        <input type="number" formControlName="displayOrder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Achievement</label>
                      <textarea formControlName="achievement" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border"></textarea>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Photo</label>
                      <input type="file" (change)="uploadStudentImage($event)" accept="image/*" class="mt-1 block w-full text-xs text-slate-500">
                      <div *ngIf="isUploadingStudentImage" class="text-xs text-indigo-600 mt-1">Uploading...</div>
                      <div *ngIf="studentForm.get('photoUrl')?.value" class="mt-2">
                        <img [src]="studentForm.get('photoUrl')?.value" class="h-16 w-16 object-cover rounded-full border">
                      </div>
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Publish to Homepage</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="studentForm.invalid || isSavingStudent || isUploadingStudentImage" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingStudent ? 'Saving...' : (isEditingStudent ? 'Update Student' : 'Add Student') }}
                      </button>
                      <button *ngIf="isEditingStudent" type="button" (click)="cancelStudentEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Student Details</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of studentsList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3">
                          <div class="flex items-center">
                            <div class="h-10 w-10 shrink-0">
                              <img class="h-10 w-10 rounded-full object-cover bg-gray-100" [src]="item.photoUrl || 'assets/placeholder-user.jpg'" alt="">
                            </div>
                            <div class="ml-4 max-w-[250px]">
                              <div class="font-medium text-gray-900 text-sm truncate" [title]="item.name">{{item.name}} <span class="text-xs text-gray-500 font-normal">({{item.class}})</span></div>
                              <div class="text-xs text-gray-500 truncate mt-0.5" [title]="item.achievement">{{item.achievement}}</div>
                            </div>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editStudent(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteStudent(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="studentsList.length === 0">
                        <td colspan="3" class="py-8 text-center text-sm text-gray-500">No students found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <!-- Home Statistics Tab -->
          <div *ngIf="activeTab === 'stats'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Home Statistics</h2>
                <p class="text-sm text-gray-500">Manage the key numbers displayed on the homepage (e.g. 100+ Teachers).</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingStat ? 'Edit Statistic' : 'Add New Statistic' }}</h3>
                  <form [formGroup]="statForm" (ngSubmit)="saveStat()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Statistic Value <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="value" placeholder="e.g. 5000+" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border font-bold text-indigo-600">
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Label <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="label" placeholder="e.g. Happy Students" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Display Order</label>
                      <input type="number" formControlName="displayOrder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="statForm.invalid || isSavingStat" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingStat ? 'Saving...' : (isEditingStat ? 'Update Stat' : 'Add Stat') }}
                      </button>
                      <button *ngIf="isEditingStat" type="button" (click)="cancelStatEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Statistic</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of statsList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3">
                          <div class="flex items-center gap-3">
                            <span class="text-2xl font-black text-indigo-600">{{item.value}}</span>
                            <span class="text-sm font-medium text-gray-900">{{item.label}}</span>
                          </div>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editStat(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteStat(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="statsList.length === 0">
                        <td colspan="3" class="py-8 text-center text-sm text-gray-500">No statistics found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

          <!-- Announcements Tab -->
          <div *ngIf="activeTab === 'announcements'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Manage Announcements</h2>
                <p class="text-sm text-gray-500">Add, edit, or remove announcements displayed in the notice board.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingAnnouncement ? 'Edit Announcement' : 'Add New Announcement' }}</h3>
                  <form [formGroup]="announcementForm" (ngSubmit)="saveAnnouncement()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Notice Text <span class="text-red-500">*</span></label>
                      <textarea formControlName="noticeText" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" placeholder="Enter notice text..."></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Type</label>
                        <select formControlName="noticeType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-white">
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="alert">Alert</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Priority</label>
                        <input type="number" formControlName="priority" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Start Date</label>
                        <input type="date" formControlName="startDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Expiry Date</label>
                        <input type="date" formControlName="expiryDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="announcementForm.invalid || isSavingAnnouncement" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingAnnouncement ? 'Saving...' : (isEditingAnnouncement ? 'Update Notice' : 'Add Notice') }}
                      </button>
                      <button *ngIf="isEditingAnnouncement" type="button" (click)="cancelAnnouncementEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Notice Text</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Type</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of announcementsList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 max-w-[300px] truncate" [title]="item.noticeText">
                          {{item.noticeText}}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 uppercase" 
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': item.noticeType === 'info',
                              'bg-yellow-100 text-yellow-800': item.noticeType === 'warning',
                              'bg-red-100 text-red-800': item.noticeType === 'alert',
                              'bg-green-100 text-green-800': item.noticeType === 'event'
                            }">
                            {{item.noticeType}}
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editAnnouncement(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteAnnouncement(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="announcementsList.length === 0">
                        <td colspan="4" class="py-8 text-center text-sm text-gray-500">No announcements found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Holidays Tab -->
          <div *ngIf="activeTab === 'holidays'">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-xl font-bold">Manage Holidays</h2>
                <p class="text-sm text-gray-500">Add, edit, or remove holidays displayed in the school holiday calendar.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form Panel -->
              <div class="lg:col-span-1">
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-6">
                  <h3 class="font-bold text-gray-700 mb-4">{{ isEditingHoliday ? 'Edit Holiday' : 'Add New Holiday' }}</h3>
                  <form [formGroup]="holidayForm" (ngSubmit)="saveHoliday()" class="space-y-4">
                    
                    <div>
                      <label class="block text-xs font-medium text-gray-700">Holiday Name <span class="text-red-500">*</span></label>
                      <input type="text" formControlName="title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" placeholder="e.g. Independence Day">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Date <span class="text-red-500">*</span></label>
                        <input type="date" formControlName="date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border">
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700">Type</label>
                        <select formControlName="type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border bg-white">
                          <option value="National">National</option>
                          <option value="Regional">Regional</option>
                          <option value="Restricted">Restricted</option>
                          <option value="Observance">Observance</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-700">Description</label>
                      <textarea formControlName="description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm p-2 border" placeholder="Details..."></textarea>
                    </div>

                    <div class="flex items-center pt-2">
                      <input type="checkbox" formControlName="isActive" class="h-4 w-4 text-indigo-600 rounded border-gray-300">
                      <label class="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                    
                    <div class="flex gap-2 pt-4 border-t border-gray-200">
                      <button type="submit" [disabled]="holidayForm.invalid || isSavingHoliday" class="flex-1 bg-indigo-600 text-white px-4 py-2 text-sm rounded shadow hover:bg-indigo-700 disabled:opacity-50">
                        {{ isSavingHoliday ? 'Saving...' : (isEditingHoliday ? 'Update Holiday' : 'Add Holiday') }}
                      </button>
                      <button *ngIf="isEditingHoliday" type="button" (click)="cancelHolidayEdit()" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- List Panel -->
              <div class="lg:col-span-2">
                <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                  <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Holiday Name</th>
                        <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Type</th>
                        <th class="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr *ngFor="let item of holidaysList">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          {{item.title}}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {{item.date | date:'mediumDate'}}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-purple-100 text-purple-800">
                            {{item.type}}
                          </span>
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-center">
                          <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{item.isActive ? 'Active' : 'Inactive'}}
                          </span>
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button (click)="editHoliday(item)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                          <button (click)="deleteHoliday(item.id!)" class="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                      <tr *ngIf="holidaysList.length === 0">
                        <td colspan="5" class="py-8 text-center text-sm text-gray-500">No holidays found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
    { id: 'stats', name: 'Home Statistics' },
    { id: 'announcements', name: 'Announcements' },
    { id: 'holidays', name: 'Holidays' }
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

  eventsList: UpcomingEvent[] = [];
  eventForm: FormGroup;
  isEditingEvent = false;
  isSavingEvent = false;
  isUploadingEventImage = false;

  activitiesList: RecentActivity[] = [];
  activityForm: FormGroup;
  isEditingActivity = false;
  isSavingActivity = false;
  isUploadingActivityImage = false;

  facultyList: FacultyExcellence[] = [];
  facultyForm: FormGroup;
  isEditingFaculty = false;
  isSavingFaculty = false;
  isUploadingFacultyImage = false;

  studentsList: StudentSpotlight[] = [];
  studentForm: FormGroup;
  isEditingStudent = false;
  isSavingStudent = false;
  isUploadingStudentImage = false;

  statsList: HomeStatistic[] = [];
  statForm: FormGroup;
  isEditingStat = false;
  isSavingStat = false;

  announcementsList: NewsTicker[] = [];
  announcementForm!: FormGroup;
  isEditingAnnouncement = false;
  isSavingAnnouncement = false;

  holidaysList: Holiday[] = [];
  holidayForm!: FormGroup;
  isEditingHoliday = false;
  isSavingHoliday = false;

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

    this.eventForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      eventDate: ['', Validators.required],
      time: [''],
      description: [''],
      imageUrl: [''],
      isActive: [true]
    });

    this.activityForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      description: [''],
      displayOrder: [0],
      imageUrl: [''],
      isActive: [true]
    });

    this.facultyForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      designation: [''],
      department: [''],
      achievement: [''],
      photoUrl: [''],
      displayOrder: [0],
      isActive: [true]
    });

    this.studentForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      class: [''],
      achievement: [''],
      photoUrl: [''],
      displayOrder: [0],
      isActive: [true]
    });

    this.statForm = this.fb.group({
      id: [0],
      label: ['', Validators.required],
      value: ['', Validators.required],
      displayOrder: [0],
      isActive: [true]
    });

    this.announcementForm = this.fb.group({
      id: [0],
      noticeText: ['', Validators.required],
      noticeType: ['info', Validators.required],
      priority: [1],
      startDate: [''],
      expiryDate: [''],
      isActive: [true]
    });

    this.holidayForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      date: ['', Validators.required],
      type: ['National', Validators.required],
      description: [''],
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
        } else if (this.activeTab === 'events') {
          this.loadEvents();
        } else if (this.activeTab === 'activities') {
          this.loadActivities();
        } else if (this.activeTab === 'faculty') {
          this.loadFaculty();
        } else if (this.activeTab === 'students') {
          this.loadStudents();
        } else if (this.activeTab === 'stats') {
          this.loadStats();
        } else if (this.activeTab === 'announcements') {
          this.loadAnnouncements();
        } else if (this.activeTab === 'holidays') {
          this.loadHolidays();
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

  // --- Upcoming Events Logic ---
  loadEvents() {
    this.cms.getItems('UpcomingEvents').subscribe(res => {
      // Need to format dates for input type="date" YYYY-MM-DD
      this.eventsList = res.map(e => ({
        ...e,
        eventDate: e.eventDate ? new Date(e.eventDate).toISOString().split('T')[0] : ''
      }));
    });
  }

  uploadEventImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingEventImage = true;
      this.cms.uploadImage(file).subscribe({
        next: (res) => {
          this.eventForm.patchValue({ imageUrl: res.url });
          this.isUploadingEventImage = false;
        },
        error: () => this.isUploadingEventImage = false
      });
    }
  }

  editEvent(item: UpcomingEvent) {
    this.isEditingEvent = true;
    this.eventForm.patchValue({
      ...item,
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : ''
    });
  }

  cancelEventEdit() {
    this.isEditingEvent = false;
    this.eventForm.reset({ id: 0, title: '', eventDate: '', time: '', description: '', imageUrl: '', isActive: true });
  }

  saveEvent() {
    if (this.eventForm.invalid) return;
    this.isSavingEvent = true;
    const val = this.eventForm.value;
    const req = this.isEditingEvent 
      ? this.cms.updateItem('UpcomingEvents', val.id, val)
      : this.cms.addItem('UpcomingEvents', val);
    
    req.subscribe({
      next: () => {
        this.isSavingEvent = false;
        this.cancelEventEdit();
        this.loadEvents();
      },
      error: () => this.isSavingEvent = false
    });
  }
  deleteEvent(id: number) {
    if(confirm('Are you sure you want to delete this event?')) {
      this.cms.deleteItem('UpcomingEvents', id).subscribe(() => this.loadEvents());
    }
  }

  // --- Recent Activities Tab ---
  // Note: HTML template logic would be injected here in a real scenario,
  // but as per requested code structure, we maintain the component methods.

  loadActivities() {
    this.cms.getItems('RecentActivities').subscribe(res => this.activitiesList = res);
  }

  uploadActivityImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingActivityImage = true;
      this.cms.uploadImage(file).subscribe({
        next: (res) => {
          this.activityForm.patchValue({ imageUrl: res.url });
          this.isUploadingActivityImage = false;
        },
        error: () => this.isUploadingActivityImage = false
      });
    }
  }

  editActivity(item: RecentActivity) {
    this.isEditingActivity = true;
    this.activityForm.patchValue(item);
  }

  cancelActivityEdit() {
    this.isEditingActivity = false;
    this.activityForm.reset({ id: 0, title: '', description: '', displayOrder: 0, imageUrl: '', isActive: true });
  }

  saveActivity() {
    if (this.activityForm.invalid) return;
    this.isSavingActivity = true;
    const val = this.activityForm.value;
    const req = this.isEditingActivity 
      ? this.cms.updateItem('RecentActivities', val.id, val)
      : this.cms.addItem('RecentActivities', val);
    
    req.subscribe({
      next: () => {
        this.isSavingActivity = false;
        this.cancelActivityEdit();
        this.loadActivities();
      },
      error: () => this.isSavingActivity = false
    });
  }

  deleteActivity(id: number) {
    if(confirm('Are you sure you want to delete this activity?')) {
      this.cms.deleteItem('RecentActivities', id).subscribe(() => this.loadActivities());
    }
  }

  // --- Faculty Excellence Logic ---
  loadFaculty() {
    this.cms.getItems('FacultyExcellences').subscribe(res => this.facultyList = res);
  }

  uploadFacultyImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingFacultyImage = true;
      this.cms.uploadImage(file).subscribe({
        next: (res) => {
          this.facultyForm.patchValue({ photoUrl: res.url });
          this.isUploadingFacultyImage = false;
        },
        error: () => this.isUploadingFacultyImage = false
      });
    }
  }

  editFaculty(item: FacultyExcellence) {
    this.isEditingFaculty = true;
    this.facultyForm.patchValue(item);
  }

  cancelFacultyEdit() {
    this.isEditingFaculty = false;
    this.facultyForm.reset({ id: 0, name: '', designation: '', department: '', achievement: '', photoUrl: '', displayOrder: 0, isActive: true });
  }

  saveFaculty() {
    if (this.facultyForm.invalid) return;
    this.isSavingFaculty = true;
    const val = this.facultyForm.value;
    const req = this.isEditingFaculty 
      ? this.cms.updateItem('FacultyExcellences', val.id, val)
      : this.cms.addItem('FacultyExcellences', val);
    
    req.subscribe({
      next: () => {
        this.isSavingFaculty = false;
        this.cancelFacultyEdit();
        this.loadFaculty();
      },
      error: () => this.isSavingFaculty = false
    });
  }

  deleteFaculty(id: number) {
    if(confirm('Are you sure you want to delete this faculty member?')) {
      this.cms.deleteItem('FacultyExcellences', id).subscribe(() => this.loadFaculty());
    }
  }

  // --- Student Spotlight Logic ---
  loadStudents() {
    this.cms.getItems('StudentSpotlights').subscribe(res => this.studentsList = res);
  }

  uploadStudentImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingStudentImage = true;
      this.cms.uploadImage(file).subscribe({
        next: (res) => {
          this.studentForm.patchValue({ photoUrl: res.url });
          this.isUploadingStudentImage = false;
        },
        error: () => this.isUploadingStudentImage = false
      });
    }
  }

  editStudent(item: StudentSpotlight) {
    this.isEditingStudent = true;
    this.studentForm.patchValue(item);
  }

  cancelStudentEdit() {
    this.isEditingStudent = false;
    this.studentForm.reset({ id: 0, name: '', class: '', achievement: '', photoUrl: '', displayOrder: 0, isActive: true });
  }

  saveStudent() {
    if (this.studentForm.invalid) return;
    this.isSavingStudent = true;
    const val = this.studentForm.value;
    const req = this.isEditingStudent 
      ? this.cms.updateItem('StudentSpotlights', val.id, val)
      : this.cms.addItem('StudentSpotlights', val);
    
    req.subscribe({
      next: () => {
        this.isSavingStudent = false;
        this.cancelStudentEdit();
        this.loadStudents();
      },
      error: () => this.isSavingStudent = false
    });
  }

  deleteStudent(id: number) {
    if(confirm('Are you sure you want to delete this student record?')) {
      this.cms.deleteItem('StudentSpotlights', id).subscribe(() => this.loadStudents());
    }
  }

  // --- Home Statistics Logic ---
  loadStats() {
    this.cms.getItems('HomeStatistics').subscribe(res => this.statsList = res);
  }

  editStat(item: HomeStatistic) {
    this.isEditingStat = true;
    this.statForm.patchValue(item);
  }

  cancelStatEdit() {
    this.isEditingStat = false;
    this.statForm.reset({ id: 0, label: '', value: '', displayOrder: 0, isActive: true });
  }

  saveStat() {
    if (this.statForm.invalid) return;
    this.isSavingStat = true;
    const val = this.statForm.value;
    const req = this.isEditingStat 
      ? this.cms.updateItem('HomeStatistics', val.id, val)
      : this.cms.addItem('HomeStatistics', val);
    
    req.subscribe({
      next: () => {
        this.isSavingStat = false;
        this.cancelStatEdit();
        this.loadStats();
      },
      error: () => this.isSavingStat = false
    });
  }

  deleteStat(id: number) {
    if(confirm('Are you sure you want to delete this statistic?')) {
      this.cms.deleteItem('HomeStatistics', id).subscribe(() => this.loadStats());
    }
  }

  // --- Announcements Logic ---
  loadAnnouncements() {
    this.cms.getItems('NewsTickers').subscribe(res => {
      this.announcementsList = res.map(a => ({
        ...a,
        startDate: a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
        expiryDate: a.expiryDate ? new Date(a.expiryDate).toISOString().split('T')[0] : ''
      }));
    });
  }

  editAnnouncement(item: NewsTicker) {
    this.isEditingAnnouncement = true;
    this.announcementForm.patchValue({
      ...item,
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''
    });
  }

  cancelAnnouncementEdit() {
    this.isEditingAnnouncement = false;
    this.announcementForm.reset({ id: 0, noticeText: '', noticeType: 'info', priority: 1, startDate: '', expiryDate: '', isActive: true });
  }

  saveAnnouncement() {
    if (this.announcementForm.invalid) return;
    this.isSavingAnnouncement = true;
    const val = this.announcementForm.value;
    const req = this.isEditingAnnouncement
      ? this.cms.updateItem('NewsTickers', val.id, val)
      : this.cms.addItem('NewsTickers', val);

    req.subscribe({
      next: () => {
        this.isSavingAnnouncement = false;
        this.cancelAnnouncementEdit();
        this.loadAnnouncements();
      },
      error: () => this.isSavingAnnouncement = false
    });
  }

  deleteAnnouncement(id: number) {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.cms.deleteItem('NewsTickers', id).subscribe(() => this.loadAnnouncements());
    }
  }

  // --- Holidays Logic ---
  loadHolidays() {
    this.cms.getItems('Holidays').subscribe(res => {
      this.holidaysList = res.map(h => ({
        ...h,
        date: h.date ? new Date(h.date).toISOString().split('T')[0] : ''
      }));
    });
  }

  editHoliday(item: Holiday) {
    this.isEditingHoliday = true;
    this.holidayForm.patchValue({
      ...item,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ''
    });
  }

  cancelHolidayEdit() {
    this.isEditingHoliday = false;
    this.holidayForm.reset({ id: 0, title: '', date: '', type: 'National', description: '', isActive: true });
  }

  saveHoliday() {
    if (this.holidayForm.invalid) return;
    this.isSavingHoliday = true;
    const val = this.holidayForm.value;
    const req = this.isEditingHoliday
      ? this.cms.updateItem('Holidays', val.id, val)
      : this.cms.addItem('Holidays', val);

    req.subscribe({
      next: () => {
        this.isSavingHoliday = false;
        this.cancelHolidayEdit();
        this.loadHolidays();
      },
      error: () => this.isSavingHoliday = false
    });
  }

  deleteHoliday(id: number) {
    if (confirm('Are you sure you want to delete this holiday?')) {
      this.cms.deleteItem('Holidays', id).subscribe(() => this.loadHolidays());
    }
  }
}
