import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { IconModule } from '../../icon/icon.module';
import { Router } from '@angular/router';

interface SocialLink {
  label: string;
  icon: string; // tabler icon name
  url: string;
}

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, MaterialModule, IconModule],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
})
export class EmpresaComponent {
  private router = inject(Router);
  titulo = 'Quiénes Somos';
  tagline = 'Conectamos clientes con fabricantes verificados de ropa.';
  descripcion = `Somos el puente confiable entre el cliente y los fabricantes y distribuidores de indumentaria. Reunimos vendedores 100% verificados para que puedas comprar con tranquilidad y acceder a productos de calidad directamente desde la fuente.`;
  verificacion = [
    'Validamos identidad y datos comerciales del vendedor.',
    'Revisamos origen y consistencia de sus productos.',
    'Monitorizamos reputación y calificaciones.',
    'Aplicamos controles continuos para mantener el estándar.',
  ];
  beneficiosClientes = [
    'Acceso directo a fabricantes y distribuidores reales.',
    'Mayor transparencia en precios y condiciones.',
    'Reducción de intermediarios y tiempos de respuesta.',
    'Confianza: cada vendedor pasó por controles de autenticidad.',
  ];
  beneficiosVendedores = [
    'Mayor visibilidad ante compradores calificados.',
    'Espacio centralizado para mostrar catálogo.',
    'Herramientas futuras de analítica y posicionamiento.',
    'Reputación construida sobre verificación transparente.',
  ];
  contacto = {
    email: 'contacto@dwidea.com',
    telefono: '+54 11 5555-5555',
    horario: 'Lun a Vie 9:00 - 18:00 (GMT-3)',
  };
  redes: SocialLink[] = [
    { label: 'Sitio Web', icon: 'world-www', url: 'https://dwidea.com' },
    {
      label: 'Instagram',
      icon: 'brand-instagram',
      url: 'https://instagram.com/dwidea',
    },
    {
      label: 'Facebook',
      icon: 'brand-facebook',
      url: 'https://facebook.com/dwidea',
    },
    {
      label: 'LinkedIn',
      icon: 'brand-linkedin',
      url: 'https://linkedin.com/company/dwidea',
    },
  ];

  currentYear = new Date().getFullYear();

  goBack() {
    this.router.navigate(['/']);
  }
}
