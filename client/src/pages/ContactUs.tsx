import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle, Clock } from "lucide-react";

export default function ContactUs() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast({
        title: "Success",
        description: "Your message has been sent. We'll get back to you soon!",
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">CONTACT US</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Contact Info Cards */}
          <div className="bg-white p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-gray-900 mr-3" />
              <h3 className="text-lg font-medium tracking-wide">Email</h3>
            </div>
            <p className="text-gray-600 font-light">support@modfy.com</p>
            <p className="text-gray-600 font-light">info@modfy.com</p>
            <p className="text-gray-500 text-sm mt-2">We'll respond within 24 hours</p>
          </div>

          <div className="bg-white p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Phone className="w-6 h-6 text-gray-900 mr-3" />
              <h3 className="text-lg font-medium tracking-wide">Phone</h3>
            </div>
            <p className="text-gray-600 font-light">+1 (555) 123-4567</p>
            <p className="text-gray-500 text-sm mt-2">Monday - Friday, 9am - 6pm EST</p>
          </div>

          <div className="bg-white p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-gray-900 mr-3" />
              <h3 className="text-lg font-medium tracking-wide">Hours</h3>
            </div>
            <p className="text-gray-600 font-light">Monday - Friday</p>
            <p className="text-gray-600 font-light">9:00 AM - 6:00 PM EST</p>
            <p className="text-gray-500 text-sm mt-2">Closed on weekends</p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-light tracking-wide mb-8 text-center">Follow Us</h2>
          <div className="flex justify-center gap-8">
            <a
              href="https://instagram.com/modfy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center group-hover:shadow-md group-hover:border-gray-300 transition-all">
                <Instagram className="w-6 h-6 text-gray-900 group-hover:text-pink-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-light">Instagram</p>
            </a>

            <a
              href="https://facebook.com/modfy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center group-hover:shadow-md group-hover:border-gray-300 transition-all">
                <Facebook className="w-6 h-6 text-gray-900 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-light">Facebook</p>
            </a>

            <a
              href="https://tiktok.com/@modfy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center group-hover:shadow-md group-hover:border-gray-300 transition-all">
                <svg className="w-6 h-6 text-gray-900 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.9 2.9 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.44-.05z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mt-3 font-light">TikTok</p>
            </a>

            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center group-hover:shadow-md group-hover:border-gray-300 transition-all">
                <MessageCircle className="w-6 h-6 text-gray-900 group-hover:text-green-600 transition-colors" />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-light">WhatsApp</p>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto bg-white p-12 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-light tracking-wide mb-8">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white hover:bg-gray-800 h-12 text-base font-medium tracking-wide"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
