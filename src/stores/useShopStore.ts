import { create } from 'zustand';
import { getPublicApiUrl } from '@/lib/env';

interface ShopState {
  products: any[];
  backendColors: any[];
  backendSizes: any[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Filters
  searchQuery: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedColor: string;
  selectedSize: string;
  priceRange: number[] | null;
  maxPrice: number;

  // Actions
  setFilters: (filters: Partial<ShopState>) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  fetchData: () => Promise<void>;
  fetchConfigData: () => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  products: [],
  backendColors: [],
  backendSizes: [],
  loading: true,
  pagination: { page: 1, limit: 12, total: 0, pages: 1 },
  
  searchQuery: "",
  selectedCategory: "",
  selectedBrand: "",
  selectedColor: "",
  selectedSize: "",
  priceRange: null,
  maxPrice: 1000,

  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, pagination: { ...state.pagination, page: 1 } }));
    get().fetchData();
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchData();
  },

  resetFilters: () => {
    set({
      searchQuery: "",
      selectedCategory: "",
      selectedBrand: "",
      selectedColor: "",
      selectedSize: "",
      priceRange: [0, get().maxPrice],
      pagination: { ...get().pagination, page: 1 }
    });
    get().fetchData();
  },

  fetchConfigData: async () => {
    try {
      const url = getPublicApiUrl();
      const [colorsRes, sizesRes] = await Promise.all([
        fetch(`${url}/colors`),
        fetch(`${url}/sizes`)
      ]);
      const colorsJson = await colorsRes.json();
      const sizesJson = await sizesRes.json();

      set({
        backendColors: colorsJson.success && colorsJson.data ? colorsJson.data : [],
        backendSizes: sizesJson.success && sizesJson.data ? sizesJson.data : []
      });
    } catch (err) {
      console.error("Failed to fetch config data:", err);
    }
  },

  fetchData: async () => {
    try {
      set({ loading: true });
      const url = getPublicApiUrl();
      const state = get();
      
      const queryParams = new URLSearchParams({
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString(),
      });

      if (state.searchQuery) queryParams.append('search', state.searchQuery);
      if (state.selectedCategory && state.selectedCategory !== 'All Categories') queryParams.append('category', state.selectedCategory);
      if (state.selectedBrand && state.selectedBrand !== 'All Brands') queryParams.append('brand', state.selectedBrand);
      if (state.selectedColor) queryParams.append('color', state.selectedColor);
      if (state.selectedSize) queryParams.append('size', state.selectedSize);
      if (state.priceRange) {
        queryParams.append('minPrice', state.priceRange[0].toString());
        queryParams.append('maxPrice', state.priceRange[1].toString());
      }

      const res = await fetch(`${url}/public/products?${queryParams.toString()}`);
      const json = await res.json();
      
      let productsData = [];
      let paginationData = get().pagination;

      if (json && json.data) {
        productsData = json.data;
        if (json.pagination) paginationData = json.pagination;
      } else if (Array.isArray(json)) {
        productsData = json;
      }

      // Automatically determine maxPrice if not restricted by priceRange and maxPrice is basic default
      if (productsData.length > 0 && state.maxPrice === 1000 && !state.priceRange) {
          const prodMax = Math.max(...productsData.map((p: any) => parseFloat(p.price || 0)));
          const limit = Math.ceil(prodMax / 100) * 100 || 1000;
          set({ maxPrice: limit, priceRange: [0, limit] });
      }

      set({ products: productsData, pagination: paginationData });
    } catch (err) {
      console.error("Failed to fetch products data:", err);
    } finally {
      set({ loading: false });
    }
  }
}));
