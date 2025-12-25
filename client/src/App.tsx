import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Categories from "@/pages/Categories";
import About from "@/pages/About";
import ContactUs from "@/pages/ContactUs";
import Auth from "@/pages/Auth";
import Wishlist from "@/pages/Wishlist";
import Profile from "@/pages/Profile";
import Checkout from "@/pages/Checkout";
import AdminRoot from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Admin routes - no main layout */}
      <Route path="/admin">
        <AdminRoot />
      </Route>
      <Route path="/admin/:rest*">
        <AdminRoot />
      </Route>

      {/* Public routes - with main layout */}
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/shop">
        <Layout>
          <Shop />
        </Layout>
      </Route>
      <Route path="/categories">
        <Layout>
          <Categories />
        </Layout>
      </Route>
      <Route path="/categories/:slug">
        <Layout>
          <Categories />
        </Layout>
      </Route>
      <Route path="/products/:slug">
        <Layout>
          <ProductDetail />
        </Layout>
      </Route>
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>
      <Route path="/contact">
        <Layout>
          <ContactUs />
        </Layout>
      </Route>
      <Route path="/auth">
        <Layout>
          <Auth />
        </Layout>
      </Route>
      <Route path="/wishlist">
        <Layout>
          <Wishlist />
        </Layout>
      </Route>
      <Route path="/profile">
        <Layout>
          <Profile />
        </Layout>
      </Route>
      <Route path="/checkout">
        <Layout>
          <Checkout />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
