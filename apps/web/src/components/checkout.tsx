"use client";

import React, { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Loader, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import formatPrice from "@/lib/format-price";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Confetti from "react-confetti";

interface CheckoutForm {
  shippingAddress: string;
  billingAddress: string;
  notes: string;
}

const Checkout = () => {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    shippingAddress: "",
    billingAddress: "",
    notes: "",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CheckoutForm) => {
      if (items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        variant: undefined,
      }));

      return await orpc.shop.createOrder.call({
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress || orderData.shippingAddress,
        paymentMethod: "pay_on_delivery",
        notes: orderData.notes || undefined,
      });
    },
    onSuccess: (order) => {
      setShowSuccessModal(true);
      setTimeout(() => {
        clearCart();
      }, 500);
      toast.success("Order placed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place order");
    },
  });

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push(`/dashboard`);
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.shippingAddress.trim()) {
      toast.error("Shipping address is required");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    createOrderMutation.mutate(form);
  };

  if (items.length === 0 && !showSuccessModal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Button onClick={() => router.push("/shop")}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary">Free</Badge>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={form.shippingAddress}
                    onChange={(e) =>
                      handleInputChange("shippingAddress", e.target.value)
                    }
                    placeholder="Enter your full shipping address..."
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">
                    Billing Address (optional)
                  </Label>
                  <Textarea
                    id="billingAddress"
                    value={form.billingAddress}
                    onChange={(e) =>
                      handleInputChange("billingAddress", e.target.value)
                    }
                    placeholder="Leave empty to use shipping address..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="p-3 border rounded-md bg-muted">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                      <span className="font-medium">Pay on Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pay when your order arrives at your doorstep
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createOrderMutation.isPending || items.length === 0}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - ${formatPrice(total)}`
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          {showSuccessModal && (
            <Confetti
              width={typeof window !== "undefined" ? window.innerWidth : 400}
              height={typeof window !== "undefined" ? window.innerHeight : 600}
              recycle={false}
              numberOfPieces={200}
            />
          )}
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <span className="text-2xl font-bold">
                  Order Placed Successfully!
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Your order has been placed successfully. You will receive a
              confirmation email shortly.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium">
                🎉 Thank you for your order!
              </p>
              <p className="text-green-600 dark:text-green-300 text-sm mt-1">
                We'll prepare your items for delivery right away.
              </p>
            </div>
          </div>
          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;
