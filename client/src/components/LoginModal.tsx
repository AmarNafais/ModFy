import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login with email:", email);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleOverlayClick}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white max-w-md w-full mx-4 p-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-light tracking-wider mb-2">MODFY</h2>
          <h3 className="text-lg font-medium mb-2">Log in</h3>
          <p className="text-sm text-gray-600 font-light">Enter your email and we'll send you a login code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-login">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
              data-testid="input-email"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-luxury-black text-white hover:bg-gray-800"
            data-testid="button-continue"
          >
            Continue
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">
            Privacy
          </a>
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-luxury-black transition-colors"
          data-testid="button-close-login"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
