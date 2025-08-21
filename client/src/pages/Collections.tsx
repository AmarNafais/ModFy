import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Collection } from "@shared/schema";
import { Link } from "wouter";

export default function Collections() {
  const { slug } = useParams();

  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
  });

  const { data: selectedCollection } = useQuery<Collection>({
    queryKey: ['/api/collections', slug],
    enabled: !!slug,
  });

  // If viewing a specific collection
  if (slug && selectedCollection) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Collection Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light tracking-wide mb-4" data-testid="collection-title">
              {selectedCollection.name.toUpperCase()}
            </h1>
            <p className="text-gray-600 font-light max-w-2xl mx-auto" data-testid="collection-description">
              {selectedCollection.description}
            </p>
            {selectedCollection.season && selectedCollection.year && (
              <p className="text-sm text-gray-500 font-light mt-2">
                {selectedCollection.season} {selectedCollection.year}
              </p>
            )}
          </div>

          {/* Collection Hero Image */}
          {selectedCollection.imageUrl && (
            <div className="mb-16">
              <div className="aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
                <img 
                  src={selectedCollection.imageUrl} 
                  alt={selectedCollection.name}
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          )}

          {/* Collection Products */}
          <div className="text-center">
            <Link href="/shop">
              <a className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors inline-block" data-testid="button-shop-collection">
                SHOP THIS COLLECTION
              </a>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // Collections overview page
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">COLLECTIONS</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Explore our carefully curated collections, each designed to capture a unique aesthetic and lifestyle.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12" data-testid="collections-grid">
          {collections.map((collection, index) => (
            <div key={collection.id} className={`${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              <Link href={`/collections/${collection.slug}`}>
                <a className="group block">
                  <div className={`aspect-[4/5] ${index === 0 ? 'lg:aspect-[4/6]' : ''} overflow-hidden mb-6`}>
                    <img 
                      src={collection.imageUrl} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" 
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-light tracking-wide mb-2" data-testid={`collection-name-${collection.id}`}>
                      {collection.name.toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-600 font-light mb-3" data-testid={`collection-desc-${collection.id}`}>
                      {collection.description}
                    </p>
                    {collection.season && collection.year && (
                      <p className="text-xs text-gray-500 font-light">
                        {collection.season} {collection.year}
                      </p>
                    )}
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
                Each collection tells a story of modern masculinity, combining timeless design principles 
                with innovative fabric technologies. We believe in creating pieces that evolve with you, 
                adapting to your lifestyle while maintaining their sophisticated appeal.
              </p>
              <p className="text-gray-600 font-light leading-relaxed">
                From seasonal inspirations to performance innovations, every collection represents our 
                commitment to redefining what men's innerwear can be.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
