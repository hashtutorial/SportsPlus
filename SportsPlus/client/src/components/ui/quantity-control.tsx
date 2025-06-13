import { Button } from "@/components/ui/button";

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99
}: QuantityControlProps) {
  return (
    <div className="flex items-center border border-border rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (quantity > min) {
            onDecrease();
          }
        }}
        disabled={quantity <= min}
        className="px-2 py-1 h-auto"
      >
        -
      </Button>
      <span className="px-2 py-1 border-l border-r border-border">
        {quantity}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (quantity < max) {
            onIncrease();
          }
        }}
        disabled={quantity >= max}
        className="px-2 py-1 h-auto"
      >
        +
      </Button>
    </div>
  );
}
