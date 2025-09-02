import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Collection, type ProductWithCategory } from "@shared/schema";
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
  });

  const { data: featuredProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', { is_featured: true, is_active: true }],
  });

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="max-w-lg">
                <h2 className="text-4xl lg:text-5xl font-light tracking-wide mb-6 leading-tight">
                  Redefining<br />
                  Men's Comfort
                </h2>
                <p className="text-gray-600 font-light text-lg leading-relaxed mb-8">
                  Premium innerwear crafted with precision and designed for the modern man who values both comfort and sophistication.
                </p>
                <Link href="/shop">
                  <a className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors inline-block" data-testid="button-explore-collection">
                    EXPLORE COLLECTION
                  </a>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800"
                alt="Male model showcasing premium men's innerwear"
                className="w-full h-96 lg:h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Large Collection Card */}
            {collections[0] && (
              <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                <Link href={`/collections/${collections[0].slug}`}>
                  <a>
                    <img
                      src={collections[0].imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                      alt={collections[0].name}
                      className="w-full h-96 lg:h-full object-cover mb-4"
                    />
                    <div className="text-center">
                      <h3 className="text-sm font-medium tracking-wide mb-2">{collections[0].name.toUpperCase()}</h3>
                      <p className="text-xs text-gray-600 font-light tracking-wide">{collections[0].description?.toUpperCase()}</p>
                    </div>
                  </a>
                </Link>
              </div>
            )}

            {/* Other Collection Cards */}
            {collections.slice(1, 3).map((collection) => (
              <div key={collection.id}>
                <Link href={`/collections/${collection.slug}`}>
                  <a>
                    <img
                      src={collection.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                      alt={collection.name}
                      className="w-full h-80 object-cover mb-4"
                    />
                    <div className="text-center">
                      <h3 className="text-sm font-medium tracking-wide mb-2">{collection.name.toUpperCase()}</h3>
                      <p className="text-xs text-gray-600 font-light tracking-wide">{collection.description?.toUpperCase()}</p>
                    </div>
                  </a>
                </Link>
              </div>
            ))}

            {/* Editorial Section */}
            <div className="md:col-span-2 lg:col-span-2 bg-luxury-gray p-8 lg:p-12 flex items-center">
              <div>
                <h3 className="text-2xl lg:text-3xl font-light tracking-wide mb-4">SUMMER 2024</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  Our latest collection combines innovative fabric technology with timeless design principles,
                  creating innerwear that moves with you throughout your day.
                </p>
                <Link href="/collections/summer-2024">
                  <a className="text-sm font-medium tracking-wide underline hover:text-gray-600 transition-colors" data-testid="link-discover-more">
                    DISCOVER MORE
                  </a>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Products */}
      <ProductGrid
        is_featured={true}
        title="THE SIGNATURE EDIT"
        showViewAll={true}
      />

      {/* Brand Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=700"
                alt="ModFy minimalist retail interior with clean design"
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <div className="max-w-lg">
              <h2 className="text-3xl font-light tracking-wide mb-6">CRAFTED FOR THE MODERN MAN</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                At ModFy, we believe that exceptional comfort begins with exceptional materials. Each piece
                in our collection is thoughtfully designed and meticulously crafted to meet the demands of
                contemporary life.
              </p>
              <p className="text-gray-600 font-light leading-relaxed mb-8">
                From our signature cotton blends to innovative performance fabrics, we're committed to
                creating innerwear that adapts to your lifestyle while maintaining the highest standards
                of quality and comfort.
              </p>
              <Link href="/about">
                <a className="text-sm font-medium tracking-wide underline hover:text-gray-600 transition-colors" data-testid="link-learn-story">
                  LEARN OUR STORY
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-luxury-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-light tracking-wide mb-4">STAY CONNECTED</h2>
          <p className="text-gray-600 font-light mb-8 max-w-2xl mx-auto">
            Be the first to discover new collections, exclusive offers, and insights into the world of premium men's innerwear.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 text-sm border border-luxury-muted focus:outline-none focus:border-luxury-black transition-colors"
              data-testid="input-newsletter-email"
            />
            <button
              className="bg-luxury-black text-white px-6 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
              data-testid="button-newsletter-subscribe"
            >
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
