import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from 'src/app/icon/icon.module';

@Component({
  selector: 'app-customizer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IconModule
  ],
  templateUrl: './customizer.component.html',
  styleUrls: ['./customizer.component.scss']
})
export class CustomizerComponent implements OnInit {
  @Output() closeCustomizer = new EventEmitter<void>();

  // Temas disponibles basados en la paleta del logo DW
  themes = [
    {
      id: 'pink',
      name: 'Rosa DW',
      primary: '#C7346F',    // Rojo-Púrpura del logo
      secondary: '#f48fb1',
      accent: '#ec407a'
    },
    {
      id: 'deep-blue',
      name: 'Azul Profundo',
      primary: '#204A87',    // Azul Profundo del logo
      secondary: '#2A7CD9',  // Azul Medio/Cian del logo
      accent: '#1565c0'
    },
    {
      id: 'intense-red',
      name: 'Rojo Intenso',
      primary: '#DA3C3D',    // Rojo Intenso del logo
      secondary: '#ff6b6b',
      accent: '#c62828'
    },
    {
      id: 'purple-majestic',
      name: 'Púrpura Majestuoso',
      primary: '#7534A4',    // Púrpura/Magenta del logo
      secondary: '#ab47bc',
      accent: '#6a1b9a'
    },
    {
      id: 'blue-red-gradient',
      name: 'Azul-Rojo Gradiente',
      primary: '#204A87',    // Azul Profundo
      secondary: '#DA3C3D',  // Rojo Intenso
      accent: '#C7346F'      // Rojo-Púrpura
    },
    {
      id: 'purple-red-elegant',
      name: 'Púrpura-Rojo Elegante',
      primary: '#7534A4',    // Púrpura/Magenta
      secondary: '#C7346F',  // Rojo-Púrpura
      accent: '#DA3C3D'      // Rojo Intenso
    },
    {
      id: 'blue-purple-modern',
      name: 'Azul-Púrpura Moderno',
      primary: '#2A7CD9',    // Azul Medio/Cian
      secondary: '#7534A4',  // Púrpura/Magenta
      accent: '#204A87'      // Azul Profundo
    },
    {
      id: 'ocean-waves',
      name: 'Olas Oceánicas',
      primary: '#2A7CD9',    // Azul Medio/Cian
      secondary: '#204A87',  // Azul Profundo
      accent: '#1565c0'
    },
    {
      id: 'fire-gradient',
      name: 'Gradiente de Fuego',
      primary: '#DA3C3D',    // Rojo Intenso
      secondary: '#C7346F',  // Rojo-Púrpura
      accent: '#ff5722'
    },
    {
      id: 'royal-purple',
      name: 'Púrpura Real',
      primary: '#7534A4',    // Púrpura/Magenta
      secondary: '#6a1b9a',
      accent: '#4a148c'
    },
    {
      id: 'midnight-blue',
      name: 'Azul Medianoche',
      primary: '#204A87',    // Azul Profundo
      secondary: '#0d47a1',
      accent: '#002171'
    },
    {
      id: 'crimson-passion',
      name: 'Carmesí Pasión',
      primary: '#C7346F',    // Rojo-Púrpura
      secondary: '#DA3C3D',  // Rojo Intenso
      accent: '#b71c1c'
    }
  ];

  // Estado actual
  currentTheme = 'pink'; // Tema por defecto: Rosa DW
  currentDirection: 'ltr' | 'rtl' = 'ltr';

  constructor() {
    // Cargar configuración guardada
    this.loadSavedSettings();

    // Aplicar tema por defecto si no hay configuración guardada
    if (!localStorage.getItem('app-theme')) {
      this.applyTheme(this.currentTheme);
    }
  }

  ngOnInit(): void {
    // Asegurar que el tema actual se aplique cuando se abre el customizer
    this.applyTheme(this.currentTheme);
  }

  private loadSavedSettings(): void {
    const savedTheme = localStorage.getItem('app-theme');
    const savedDirection = localStorage.getItem('app-direction');

    if (savedTheme && this.themes.find(t => t.id === savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Si no hay tema guardado o es inválido, usar el tema por defecto
      this.currentTheme = 'pink';
    }

    if (savedDirection === 'rtl') {
      this.currentDirection = 'rtl';
    } else {
      this.currentDirection = 'ltr';
    }
  }

  selectTheme(themeId: string): void {
    this.currentTheme = themeId;
    this.applyTheme(themeId);
    localStorage.setItem('app-theme', themeId);
  }

  selectDirection(direction: 'ltr' | 'rtl'): void {
    this.currentDirection = direction;
    this.applyDirection(direction);
    localStorage.setItem('app-direction', direction);
  }

  private applyTheme(themeId: string): void {
    const theme = this.themes.find(t => t.id === themeId);
    if (theme) {
      const root = document.documentElement;

      // Aplicar colores del tema
      root.style.setProperty('--theme-primary', theme.primary);
      root.style.setProperty('--theme-secondary', theme.secondary);
      root.style.setProperty('--theme-accent', theme.accent);

      // Para Material Design 3, también actualizar las variables CSS de Material
      root.style.setProperty('--mat-sys-primary', theme.primary);
      root.style.setProperty('--mat-sys-secondary', theme.secondary);
      root.style.setProperty('--mat-sys-tertiary', theme.accent);
    }
  }

  private applyDirection(direction: 'ltr' | 'rtl'): void {
    const html = document.documentElement;
    html.setAttribute('dir', direction);

    // También aplicar a body para compatibilidad
    document.body.setAttribute('dir', direction);
  }

  resetToDefaults(): void {
    // Reset a tema Rosa DW (pink) y dirección LTR
    this.selectTheme('pink');
    this.selectDirection('ltr');
  }

  close(): void {
    this.closeCustomizer.emit();
  }
}