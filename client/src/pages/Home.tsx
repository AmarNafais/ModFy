import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type ProductWithCategory } from "@shared/schema";
import ProductGrid from "@/components/ProductGrid";
import { MessageCircle, Star, Quote } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  slug: string;
}

interface Review {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch contact settings for WhatsApp link
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/contact-settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch contact settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const { data: featuredProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', { is_featured: true, is_active: true }],
  });

  // Fetch random reviews for homepage
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['/api/reviews/random'],
    queryFn: async () => {
      const response = await fetch('/api/reviews/random?limit=6');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
  });

  // Filter only main categories (no parent_id)
  const mainCategories = categories.filter((cat: any) => !cat.parent_id);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="max-w-lg mx-auto lg:mx-0">
                <h2 className="text-4xl lg:text-5xl font-light tracking-wide mb-6 leading-tight">
                  Redefining<br />
                  Men's Comfort
                </h2>
                <p className="text-gray-600 font-light text-lg leading-relaxed mb-8">
                  Premium innerwear crafted with precision for men, women, and kids, delivering comfort, quality, and style for every stage of life.
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
                src="/storage/images/hero.png"
                alt="Male model showcasing premium men's innerwear"
                className="w-full h-96 lg:h-[600px] object-cover"
              />
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

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Page Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wide mb-4">CATEGORIES</h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Explore our carefully curated categories, each designed to capture a unique aesthetic and lifestyle.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {mainCategories.map((category, index) => (
              <div key={category.id}>
                <Link href={`/shop?category=${category.slug}`}>
                  <a className="group block">
                    <div className="aspect-[3/2] overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
                      <img
                        src={category.image_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                        alt={category.name}
                        className="w-full h-full object-contain group-hover:opacity-95 transition-opacity"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-light tracking-wide mb-2">
                        {category.name?.toUpperCase() || ''}
                      </h3>
                      <p className="text-sm text-gray-600 font-light mb-3">
                        {category.description}
                      </p>
                    </div>
                  </a>
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/storage/images/home.png"
                alt="ModFy minimalist retail interior with clean design"
                className="w-full h-96 lg:h-[500px] object-contain"
              />
            </div>
            <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              <h2 className="text-3xl font-light tracking-wide mb-6">CRAFTED FOR EVERYDAY LIFE</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                At ModFy, we focus on creating comfortable, reliable innerwear made with quality materials and thoughtful design. Every piece is developed to suit daily wear, balancing durability, fit, and comfort.
              </p>
              <p className="text-gray-600 font-light leading-relaxed mb-8">
                From soft cotton blends to practical fabric choices, our products are made to support your routine — whether at work, at home, or on the go.
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

      {/* Customer Reviews Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-wide mb-4">WHAT OUR CUSTOMERS SAY</h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Real experiences from our valued customers
            </p>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>

                  {review.title && (
                    <h3 className="text-lg font-medium mb-2">{review.title}</h3>
                  )}

                  {review.comment && (
                    <div className="relative mb-4">
                      <Quote className="absolute -top-2 -left-2 w-6 h-6 text-gray-200" />
                      <p className="text-gray-600 font-light text-sm leading-relaxed pl-4">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      {review.isVerifiedPurchase && (
                        <p className="text-xs text-green-600">Verified Purchase</p>
                      )}
                    </div>
                    {review.productName && (
                      <Link href={`/products/${review.productSlug}`}>
                        <a className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                          View Product →
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-light">No reviews available yet. Be the first to leave a review!</p>
            </div>
          )}
        </div>
      </section>

      {/* Wholesale Inquiry Section */}
      <section className="py-16 bg-luxury-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-light tracking-wide mb-4">WHOLESALE INQUIRIES</h2>
          <p className="text-gray-600 font-light mb-8 max-w-2xl mx-auto">
            Looking to purchase in bulk? Contact us for wholesale inquiries and get competitive prices on large orders. We offer special rates for retailers and businesses.
          </p>
          {settings?.whatsappUrl ? (
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-green-700 transition-colors"
              data-testid="button-wholesale-whatsapp"
            >
              <MessageCircle className="w-5 h-5" />
              CONTACT US ON WHATSAPP
            </a>
          ) : (
            <Link href="/contact">
              <a className="inline-flex items-center gap-2 bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
                CONTACT US
              </a>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
