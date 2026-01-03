import { Injectable } from '@angular/core';

export interface ShopState {
  products: any[];
  filteredProducts: any[];
  categories: any[];
  selectedCategories: string[];
  selectedGender: string;
  searchText: string;
  backendPage: number;
  backendTotalPages: number;
  allBackendLoaded: boolean;
  loadingBackend: boolean;
  scrollY: number;
}

@Injectable({ providedIn: 'root' })
export class ShopStateService {
  private state: ShopState | null = null;

  setState(state: ShopState) {
    this.state = { ...state };
  }

  getState(): ShopState | null {
    return this.state;
  }

  clear() {
    this.state = null;
  }
}
