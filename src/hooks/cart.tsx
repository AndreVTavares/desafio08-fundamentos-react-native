import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsAsync = await AsyncStorage.getItem('@Desafio8:products');

      if (productsAsync) {
        setProducts(JSON.parse(productsAsync));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productFinded = products.find(
        productFind => productFind.id === product.id,
      );

      // AsyncStorage vai ser praticamente isso map comparando o id que vier e atualizar o valor da quantity
      if (productFinded) {
        const newProducts = products.map(productMap => {
          if (productMap.id === productFinded.id) {
            return {
              id: productFinded.id,
              title: productFinded.title,
              image_url: productFinded.image_url,
              price: productFinded.price,
              quantity: productFinded.quantity + 1,
            };
          }
          return productMap;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@Desafio8:products',
          JSON.stringify(newProducts),
        );
      } else {
        setProducts([
          ...products,
          {
            id: product.id,
            image_url: product.image_url,
            price: product.price,
            title: product.title,
            quantity: 1,
          },
        ]);
        await AsyncStorage.setItem(
          '@Desafio8:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(productMap => {
        if (productMap.id === id) {
          return {
            id: productMap.id,
            title: productMap.title,
            image_url: productMap.image_url,
            price: productMap.price,
            quantity: productMap.quantity + 1,
          };
        }
        return productMap;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@Desafio8:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products.map(productMap => {
        if (productMap.id === id) {
          return {
            id: productMap.id,
            title: productMap.title,
            image_url: productMap.image_url,
            price: productMap.price,
            quantity: productMap.quantity - 1,
          };
        }
        return productMap;
      });

      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@Desafio8:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
