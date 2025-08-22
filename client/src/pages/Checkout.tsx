import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { Loader2, ShoppingBag, MapPin, Phone, CreditCard, MessageCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Checkout form schema
const checkoutFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  const { cartItems, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user profile for prefilling
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile", {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please login to checkout");
        }
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  // Form setup with prefilled values from profile
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      notes: "",
    },
    values: profile ? {
      fullName: profile.fullName || "",
      phoneNumber: profile.phoneNumber || "",
      addressLine1: profile.addressLine1 || "",
      addressLine2: profile.addressLine2 || "",
      city: profile.city || "",
      postalCode: profile.postalCode || "",
      notes: "",
    } : undefined,
  });

  // Generate order number
  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  // Create order
  const createOrder = async (formData: CheckoutFormData) => {
    const orderData = {
      orderNumber: generateOrderNumber(),
      totalAmount: total.toFixed(2),
      deliveryAddress: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2 || "",
        city: formData.city,
        postalCode: formData.postalCode,
      },
      phoneNumber: formData.phoneNumber,
      notes: formData.notes || "",
      status: "pending",
      paymentStatus: "pending",
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }

    return response.json();
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const order = await createOrder(data);
      
      // Clear the cart
      await clearCart();
      
      // Generate WhatsApp message
      const whatsappMessage = `Hi! I'd like to place an order:\n\n*Order Number:* ${order.orderNumber}\n*Total:* LKR ${total.toFixed(2)}\n*Delivery Address:*\n${data.fullName}\n${data.addressLine1}${data.addressLine2 ? '\n' + data.addressLine2 : ''}\n${data.city}, ${data.postalCode}\n*Phone:* ${data.phoneNumber}${data.notes ? '\n\n*Notes:* ' + data.notes : ''}`;
      const whatsappNumber = "+94771234567"; // Replace with actual business WhatsApp number
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;

      toast({
        title: "Order placed successfully!",
        description: `Your order ${order.orderNumber} has been created. Click to contact us on WhatsApp.`,
      });

      // Redirect to WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setLocation("/");
      }, 2000);

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if cart is empty
  if (!cartItems.length && !profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-wide mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <Button onClick={() => setLocation("/shop")} data-testid="button-shop-now">
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
        <p className="text-muted-foreground">
          Complete your order and we'll contact you on WhatsApp for payment and delivery confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {item.size}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.color}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Qty: {item.quantity}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">LKR {(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    LKR {item.product.price} each
                  </p>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>LKR {total.toFixed(2)}</span>
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">WhatsApp Payment</h4>
                  <p className="text-sm text-blue-700">
                    After placing your order, we'll contact you on WhatsApp to arrange payment and confirm delivery details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Information
            </CardTitle>
            <CardDescription>
              {profile ? 
                "Your profile information has been pre-filled. Update if needed." :
                "Please provide your delivery details."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            data-testid="input-checkout-full-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+94 77 123 4567" 
                            data-testid="input-checkout-phone"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Street address, building number" 
                            data-testid="input-checkout-address-1"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Line 2 (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Apartment, suite, floor" 
                            data-testid="input-checkout-address-2"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Colombo" 
                              data-testid="input-checkout-city"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="10001" 
                              data-testid="input-checkout-postal-code"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special delivery instructions or requests..." 
                            className="min-h-[80px]"
                            data-testid="input-checkout-notes"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                  data-testid="button-place-order"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Place Order (LKR {total.toFixed(2)})
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}