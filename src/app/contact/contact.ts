import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CmsService, HomePageSettings } from '../services/cms.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact implements OnInit {
  isMobileMenuOpen = false;
  currentLanguage: 'en' | 'hi' = 'en';
  settings: HomePageSettings | null = null;
  safeMapUrl: SafeResourceUrl | null = null;

  constructor(
    private cms: CmsService, 
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentLanguage = (localStorage.getItem('language') as 'en' | 'hi') || 'en';
    this.cms.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
        const mapUrl = res?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.529517170564!2d75.82025687590827!3d22.745700779368367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd02e2124cb1%3A0x67db238d212133b3!2sSuper%20Corridor%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin";
        this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
        this.cdr.detectChanges();
      }
    });
  }

  onLanguageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentLanguage = select.value as 'en' | 'hi';
    localStorage.setItem('language', this.currentLanguage);
    this.cdr.detectChanges();
  }
}
