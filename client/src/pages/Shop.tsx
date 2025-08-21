import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Category, type ProductWithCategory } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', { categoryId: selectedCategory || undefined, isActive: true }],
  });

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">SHOP</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Discover our complete collection of premium men's innerwear designed for comfort, style, and sophistication.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-6 py-2 text-sm font-medium tracking-wide transition-colors ${
              selectedCategory === "" 
                ? "bg-luxury-black text-white" 
                : "border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white"
            }`}
            data-testid="filter-all"
          >
            ALL
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 text-sm font-medium tracking-wide transition-colors ${
                selectedCategory === category.id 
                  ? "bg-luxury-black text-white" 
                  : "border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white"
              }`}
              data-testid={`filter-${category.slug}`}
            >
              {category.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 font-light">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium tracking-wide mb-2">NO PRODUCTS FOUND</h3>
            <p className="text-gray-600 font-light">Try adjusting your filters or browse all products.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-gray-600 font-light">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <select className="text-sm border border-luxury-muted px-3 py-2 focus:outline-none focus:border-luxury-black" data-testid="select-sort">
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="shop-product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

        {/* Recently Viewed Section */}
        <section className="mt-24 pt-16 border-t border-luxury-muted">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-light tracking-wide mb-4">RECENTLY VIEWED</h2>
            <p className="text-gray-600 font-light">Products you've recently looked at</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
