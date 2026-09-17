export interface CartItemProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
}

export interface CartItem {
  product: CartItemProduct;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
