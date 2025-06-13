import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryItemProps {
  category: Category;
}

export function CategoryItem({ category }: CategoryItemProps) {
  return (
    <div onClick={() => window.location.href = `/category/${category.id}`} className="cursor-pointer">
      <div className="category-item flex flex-col items-center">
        <div className="relative rounded-full overflow-hidden w-16 h-16 mb-2">
          <img 
            src={category.imageUrl} 
            alt={category.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-center text-xs">{category.name}</p>
      </div>
    </div>
  );
}
