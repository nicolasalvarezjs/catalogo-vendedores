import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea números a moneda ARS sin decimales.
 * Ej: 1234 -> $1.234 ; 1234567 -> $1.234.567
 * Reglas:
 * - Separador de miles con punto.
 * - No mostrar decimales (redondeo hacia abajo de ser float).
 * - Si valor es null/undefined retorna '-'.
 */
@Pipe({
  name: 'monedaARS',
  standalone: true,
})
export class MonedaArsPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    // Si viene string con símbolo o espacios, limpiar
    const cleaned = String(value).replace(/[^0-9]/g, '');
    if (cleaned === '') {
      return '-';
    }
    const num = Math.floor(Number(cleaned));
    // Formatear con separador de miles '.'
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted}`;
  }
}
