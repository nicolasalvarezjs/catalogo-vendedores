export interface OrderProduct {
  productoId: string;
  cantidad: number;
  vendedorId: string;
  product?: any; // info del producto (opcional, para respuesta)
  vendor?: any; // info del vendedor (opcional, para respuesta)
}

export interface Order {
  id?: string; // MongoDB _id
  orderNumber?: number; // Número incremental legible
  productos: OrderProduct[];
  fecha?: Date;
  estado?: string;
}
