import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { type Category, type ProductWithCategory } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  // Read URL params inside useEffect to ensure we get fresh values
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Update state when URL params change
  useEffect(() => {
    const updateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const catId = params.get('categoryId');
      const catSlug = params.get('category');
      const subId = params.get('subcategoryId');

      // If we have a category slug instead of ID, find the matching category
      if (catSlug && !catId && categories.length > 0) {
        const matchingCategory = categories.find((c: any) => c.slug === catSlug);
        if (matchingCategory) {
          console.log('Found category by slug:', catSlug, '-> ID:', matchingCategory.id);
          setSelectedCategory(matchingCategory.id);
          setSelectedSubcategory("");
          setSearchQuery("");
          return;
        }
      }

      console.log('URL changed - categoryId:', catId, 'subcategoryId:', subId);
      setSelectedCategory(catId || "");
      setSelectedSubcategory(subId || "");
      setSearchQuery(""); // Clear search when navigating via menu
    };

    // Initial load
    updateFromUrl();

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', updateFromUrl);

    // Listen for custom navigation event (when links are clicked)
    window.addEventListener('locationchange', updateFromUrl);

    return () => {
      window.removeEventListener('popstate', updateFromUrl);
      window.removeEventListener('locationchange', updateFromUrl);
    };
  }, [categories]);

  const queryKey = useMemo(() => {
    const filters: any = { is_active: true };
    if (selectedCategory) filters.categoryId = selectedCategory;
    if (selectedSubcategory) filters.subcategoryId = selectedSubcategory;
    console.log('Query key updated:', ['/api/products', filters]);
    return ['/api/products', filters];
  }, [selectedCategory, selectedSubcategory]);

  const { data: allProducts = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: queryKey,
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProducts;
    }

    const query = searchQuery.toLowerCase().trim();
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.material?.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  // Sort products based on selected sort option
  const products = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "price-low":
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case "price-high":
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">SHOP</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Discover our complete collection of premium men's innerwear designed for comfort, style, and sophistication.
          </p>
          {/* Active Filter Indicator */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="mt-4 text-sm text-gray-600">
              Filtering: {categories.find((c: any) => c.id === selectedCategory)?.name}
              {selectedSubcategory && (
                <> → {categories.find((c: any) => c.id === selectedSubcategory)?.name}</>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="shop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, materials, categories..."
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-black focus:border-luxury-black text-sm"
              data-testid="input-search"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                data-testid="button-clear-search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              {products.length > 0 ? (
                <span>Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchQuery}"</span>
              ) : (
                <span>No products found for "{searchQuery}"</span>
              )}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => {
              setSelectedCategory("");
              setSelectedSubcategory("");
              setSearchQuery("");
              window.history.pushState({}, '', '/shop');
            }}
            className={`px-6 py-2 text-sm font-medium tracking-wide transition-colors ${selectedCategory === "" && selectedSubcategory === ""
              ? "bg-luxury-black text-white"
              : "border border-luxury-black text-luxury-black hover:bg-luxury-black hover:text-white"
              }`}
            data-testid="filter-all"
          >
            ALL
          </button>
          {categories.filter((cat: any) => !cat.parent_id).map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedSubcategory("");
                setSearchQuery("");
                window.history.pushState({}, '', `/shop?categoryId=${category.id}`);
              }}
              className={`px-6 py-2 text-sm font-medium tracking-wide transition-colors ${selectedCategory === category.id && !selectedSubcategory
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
            <p className="text-gray-600 font-light">
              {searchQuery ? (
                <>
                  No products match your search for "{searchQuery}".
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-luxury-black underline hover:no-underline"
                    data-testid="button-clear-search-results"
                  >
                    Clear search
                  </button>
                  {" "}or try different keywords.
                </>
              ) : (
                "Try adjusting your filters or browse all products."
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-gray-600 font-light">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <select
                className="text-sm border border-luxury-muted px-3 py-2 focus:outline-none focus:border-luxury-black"
                data-testid="select-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="shop-product-grid">
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
