import { useQuery } from "@tanstack/react-query";
import { type ProductWithCategory } from "@shared/schema";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  categoryId?: string;
  is_featured?: boolean;
  title?: string;
  showViewAll?: boolean;
}

export default function ProductGrid({ categoryId, is_featured, title, showViewAll = false }: ProductGridProps) {
  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', { categoryId, is_featured, is_active: true }],
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-light">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-light">No products found.</p>
      </div>
    );
  }

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wide mb-4">{title}</h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Carefully curated pieces that represent the pinnacle of comfort, quality, and contemporary design.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-12">
            <button
              className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
              data-testid="button-view-all"
            >
              VIEW ALL PRODUCTS
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
