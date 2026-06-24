import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService, HomePageSettings } from '../services/cms.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-principal-message',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal-message.html',
  styleUrls: ['./principal-message.css']
})
export class PrincipalMessage implements OnInit {
  isMobileMenuOpen = false;
  currentLanguage: 'en' | 'hi' = 'en';
  settings: HomePageSettings | null = null;

  constructor(
    private cms: CmsService,
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.currentLanguage = (localStorage.getItem('language') as 'en' | 'hi') || 'en';
    this.cms.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
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
