import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService, HomePageSettings } from '../services/cms.service';

@Component({
  selector: 'app-principal-message',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal-message.html',
  styleUrls: ['./principal-message.css']
})
export class PrincipalMessage implements OnInit {
  isMobileMenuOpen = false;
  isDarkMode = false;
  settings: HomePageSettings | null = null;

  constructor(private cms: CmsService) {}

  ngOnInit() {
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.cms.getSettings().subscribe({
      next: (res) => {
        this.settings = res;
      }
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
