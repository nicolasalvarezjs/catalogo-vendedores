# Catálogo Vendedores (Integración Backend)

Se actualizó la obtención de datos para usar el backend `vendedores-service` en los componentes existentes del e-commerce sin modificar estilos. El UI original (`ShopComponent`, diálogos, carruseles) se mantiene.

## Configuración de entorno

Edita `src/environments/environment.ts` si el backend corre en otro host/puerto:

```ts
export const environment = {
  production: false,
  apiBaseUrl: "http://localhost:3000",
};
```

## Endpoints utilizados

- GET `/vendor?page={page}&limit={limit}`: Lista de vendedores activos.
- GET `/product?page={page}&limit={limit}&vendorId={vendorId}`: Productos activos de un vendedor.

### Campos de producto (respuesta backend)

```jsonc
{
  "_id": "string",
  "vendorId": "string",
  "product_name": "string",
  "categoria": "string",
  "generos": ["Mujer", "Hombre"],
  "talles": "M L X", // cadena con talles
  "base_price": 19900, // precio base numérico
  "description": "ALTOS LOMPAS",
  "tela": "ALGODON",
  "salesType": "mayor",
  "images": [], // array de URLs
  "active": true,
  "rating": 0,
  "categories": [], // categorías adicionales si aplica
  "date": "2025-10-31T22:08:06.597Z"
}
```

Si `images` está vacío se usa `assets/images/products/no-image.png` como placeholder.

## Servicios de API

La app consume directamente el backend:

- `VendorApiService.getVendors(page?, limit?)`
- `ProductApiService.getProducts({ page?, limit?, vendorId })`

Se eliminó el uso de datos mock para vendedores y productos.

## Componentes existentes que usan backend

- `ShopComponent`: Obtiene vendedores paginados (scroll infinito) desde el backend.
- `VendorProductsDialogComponent`: Obtiene productos paginados del backend para el vendedor seleccionado.

## Ejecución

1. Inicia el backend NestJS (`vendedores-service`) en puerto 3000.
2. Ejecuta el frontend:

```bash
npm install
npm start
```

Abrir `http://localhost:4200`.

## Próximos pasos recomendados

- Optimizar eliminación definitiva de cualquier referencia residual a datos mock.
- Simplificar modelos y tipos alineándolos al backend.
- Añadir manejo de errores visual (snackbar/toast).
- Implementar búsqueda y filtros directamente contra la API (categorías, precio).
- Cachear páginas cargadas en un store (RxJS, Signal, NgRx si escala).
