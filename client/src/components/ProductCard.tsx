import { Link } from "wouter";
import { type ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} data-testid={`product-card-${product.id}`}>
      <a className="group cursor-pointer block">
        <div className="aspect-[3/4] overflow-hidden mb-4">
          <img 
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" 
          />
        </div>
        <div className="text-center">
          <h3 className="text-sm font-medium tracking-wide mb-1" data-testid={`product-name-${product.id}`}>
            {product.name.toUpperCase()}
          </h3>
          <p className="text-xs text-gray-600 font-light mb-2" data-testid={`product-material-${product.id}`}>
            {product.material?.toUpperCase()}
          </p>
          <span className="text-sm font-medium" data-testid={`product-price-${product.id}`}>
            ${product.price}
          </span>
        </div>
      </a>
    </Link>
  );
}
