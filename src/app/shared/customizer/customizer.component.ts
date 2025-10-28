import {
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';

interface AppSettings {
  theme?: string;
  activeTheme?: string;
  dir?: 'ltr' | 'rtl';
  sidenavOpened?: boolean;
  horizontal?: boolean;
  sidenavCollapsed?: boolean;
  cardBorder?: boolean;
  boxed?: boolean;
}

@Component({
  selector: 'app-customizer',
  imports: [TablerIconsModule, MaterialModule, FormsModule, NgScrollbarModule],
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomizerComponent {
  options: AppSettings = {
    theme: 'light',
    activeTheme: 'pink_theme',
    dir: 'ltr',
    sidenavOpened: true,
    horizontal: false,
    sidenavCollapsed: false,
    cardBorder: false,
    boxed: false,
  };

  @Output() optionsChange = new EventEmitter<AppSettings>();
  hideSingleSelectionIndicator = signal(true);

  constructor() {
    // Load from localStorage if available
    const savedTheme = localStorage.getItem('activeTheme');
    if (savedTheme) {
      this.options.activeTheme = savedTheme;
    }
  }

  setDark(theme: string) {
    this.options.theme = theme;
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    localStorage.setItem('theme', theme);
    this.emitOptions();
  }

  setColor(color: string) {
    this.options.activeTheme = color;
    document.documentElement.className = color;
    localStorage.setItem('activeTheme', color);
    this.emitOptions();
  }

  setDir(dir: 'ltr' | 'rtl') {
    this.options.dir = dir;
    document.documentElement.setAttribute('dir', dir);
    localStorage.setItem('dir', dir);
    this.emitOptions();
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }
}