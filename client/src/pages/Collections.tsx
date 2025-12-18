import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  slug: string;
}

export default function Collections() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter only main categories (no parent_id)
  const mainCategories = categories.filter((cat: any) => !cat.parent_id);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">CATEGORIES</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Explore our carefully curated categories, each designed to capture a unique aesthetic and lifestyle.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12" data-testid="collections-grid">
          {mainCategories.map((category, index) => (
            <div key={category.id}>
              <Link href={`/shop?category=${category.slug}`}>
                <a className="group block">
                  <div className="aspect-[4/5] overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
                    <img
                      src={category.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                      alt={category.name}
                      className="w-full h-full object-contain group-hover:opacity-95 transition-opacity"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-light tracking-wide mb-2" data-testid={`collection-name-${category.id}`}>
                      {category.name?.toUpperCase() || ''}
                    </h2>
                    <p className="text-sm text-gray-600 font-light mb-3" data-testid={`collection-desc-${category.id}`}>
                      {category.description}
                    </p>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>

        {/* Editorial Section */}
        <section className="mt-24 pt-16 border-t border-luxury-muted">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=700"
                alt="ModFy design philosophy"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <div className="max-w-lg lg:pl-8">
              <h2 className="text-3xl font-light tracking-wide mb-6">OUR DESIGN PHILOSOPHY</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Each category represents our commitment to modern masculinity, combining timeless design principles
                with innovative fabric technologies. We believe in creating pieces that evolve with you,
                adapting to your lifestyle while maintaining their sophisticated appeal.
              </p>
              <p className="text-gray-600 font-light leading-relaxed">
                From essential basics to performance innovations, every product represents our
                commitment to redefining what men's innerwear can be.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
