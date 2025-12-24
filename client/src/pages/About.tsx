export default function About() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">ABOUT MODFY</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            ModFy is a local manufacturer and distributor of high-quality innerwear and apparel for men, women, and kids.
            We focus on delivering everyday essentials that combine comfort, durability, and modern design — all at prices that remain affordable for families.
          </p>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=700" 
              alt="ModFy atelier and design process" 
              className="w-full h-96 lg:h-[500px] object-cover" 
            />
          </div>
          <div className="max-w-lg">
            <h2 className="text-3xl font-light tracking-wide mb-6">OUR MISSION</h2>
            <p className="text-gray-600 font-light leading-relaxed mb-6">
              To provide very good quality innerwear and apparel at affordable prices for every stage of life.
              We believe quality clothing should be accessible, reliable, and comfortable — without unnecessary cost.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wide mb-4">OUR APPROACH</h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              The principles that guide everything we do, from design to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium tracking-wide mb-3">QUALITY YOU CAN TRUST</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                We maintain strict quality checks across all our products to ensure comfort, fit, and long-lasting wear.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium tracking-wide mb-3">DESIGNED FOR EVERYDAY LIFE</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Our products are made for real life — whether it's work, casual outings, or daily routines.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium tracking-wide mb-3">AFFORDABLE & ACCESSIBLE</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                We focus on smart sourcing and efficient production to keep our pricing fair without compromising on quality.
              </p>
            </div>
          </div>
        </section>

        {/* Craftsmanship Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 max-w-lg">
              <h2 className="text-3xl font-light tracking-wide mb-6">WHAT WE DO</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                We design, manufacture, and distribute a wide range of apparel, including:
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Innerwear for men, women, and kids</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Outerwear and everyday clothing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Unisex essentials such as socks</span>
                </div>
              </div>
              <p className="text-gray-600 font-light leading-relaxed mt-6">
                By combining in-house manufacturing with carefully selected partner brands, we maintain consistent quality while offering better value to our customers.
              </p>
              <button className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors mt-8">
                VIEW OUR SIZE GUIDE
              </button>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=700" 
                alt="ModFy craftsmanship and attention to detail" 
                className="w-full h-96 lg:h-[500px] object-cover" 
              />
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="mb-24 bg-luxury-gray p-12 lg:p-16">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-light tracking-wide mb-6">WHY MODFY</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-gray-600 font-light">Very good quality at budget and mid-range prices</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-gray-600 font-light">Comfortable, practical designs for daily use</span>
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-gray-600 font-light">Family-friendly collections for all age groups</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-gray-600 font-light">Clean, minimal, and modern styling</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Looking Ahead Section
        <section className="mb-24">
          <h2 className="text-3xl font-light tracking-wide mb-6 text-center">LOOKING AHEAD</h2>
          <p className="text-gray-600 font-light leading-relaxed max-w-4xl mx-auto text-center">
            As ModFy grows, we remain committed to improving our designs, expanding our range, and continuing to deliver reliable apparel that customers can depend on every day.
          </p>
        </section> */}

        {/* Contact Section */}
        <section className="text-center">
          <h2 className="text-3xl font-light tracking-wide mb-6">GET IN TOUCH</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            Have questions about our products or company? We'd love to hear from you.
          </p>
          <button className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors" data-testid="button-contact">
            CONTACT US
          </button>
        </section>

      </div>
    </div>
  );
}
