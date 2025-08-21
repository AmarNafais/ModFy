export default function About() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">ABOUT MODFY</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Redefining men's innerwear through exceptional design, premium materials, and uncompromising quality.
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
            <h2 className="text-3xl font-light tracking-wide mb-6">OUR STORY</h2>
            <p className="text-gray-600 font-light leading-relaxed mb-6">
              Founded on the belief that exceptional comfort begins with exceptional materials, ModFy was 
              born from a desire to elevate the fundamentals of men's wardrobe. We recognized that innerwear, 
              though hidden, forms the foundation of confidence and comfort.
            </p>
            <p className="text-gray-600 font-light leading-relaxed mb-6">
              Every piece in our collection represents hours of research, testing, and refinement. We partner 
              with mills that share our commitment to sustainability and quality, ensuring that each garment 
              meets our exacting standards.
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              Today, ModFy continues to push the boundaries of what innerwear can be, creating pieces that 
              adapt to modern life while maintaining timeless appeal.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <section className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-wide mb-4">OUR VALUES</h2>
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
              <h3 className="text-lg font-medium tracking-wide mb-3">QUALITY</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                We believe in creating products that last, using only the finest materials and 
                construction techniques to ensure longevity and comfort.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium tracking-wide mb-3">COMFORT</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                Every design decision is made with comfort in mind, ensuring our products move 
                with you throughout your day without compromise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-luxury-gray rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium tracking-wide mb-3">INNOVATION</h3>
              <p className="text-sm text-gray-600 font-light leading-relaxed">
                We continuously explore new materials and technologies to enhance the performance 
                and sustainability of our products.
              </p>
            </div>
          </div>
        </section>

        {/* Craftsmanship Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 max-w-lg">
              <h2 className="text-3xl font-light tracking-wide mb-6">CRAFTSMANSHIP</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                Each ModFy garment is the result of meticulous attention to detail and time-honored 
                craftsmanship techniques. Our skilled artisans bring decades of experience to every 
                stitch, seam, and finish.
              </p>
              <p className="text-gray-600 font-light leading-relaxed mb-6">
                From the initial pattern creation to the final quality inspection, we maintain strict 
                standards that ensure consistency and excellence across our entire range.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Hand-finished seams for enhanced durability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Premium elastic waistbands with superior stretch</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-luxury-black rounded-full"></div>
                  <span className="text-sm font-light">Reinforced stress points for lasting wear</span>
                </div>
              </div>
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
            <h2 className="text-3xl font-light tracking-wide mb-6">SUSTAINABILITY</h2>
            <p className="text-gray-600 font-light leading-relaxed mb-8">
              We believe in creating products that are not only good for you, but good for the planet. 
              Our commitment to sustainability drives every aspect of our business, from material 
              sourcing to packaging and beyond.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-lg font-medium tracking-wide mb-3">RESPONSIBLE SOURCING</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  We partner with certified mills that prioritize environmental responsibility and 
                  fair labor practices in their operations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium tracking-wide mb-3">SUSTAINABLE MATERIALS</h3>
                <p className="text-sm text-gray-600 font-light leading-relaxed">
                  Our fabric selection includes organic cotton, bamboo fiber, and other eco-friendly 
                  materials that reduce environmental impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <h2 className="text-3xl font-light tracking-wide mb-6">GET IN TOUCH</h2>
          <p className="text-gray-600 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            Have questions about our products, sustainability practices, or company? We'd love to hear from you.
          </p>
          <button className="bg-luxury-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors" data-testid="button-contact">
            CONTACT US
          </button>
        </section>

      </div>
    </div>
  );
}
