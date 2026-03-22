import { cn } from "@/lib/utils";

interface ServiceBadgeProps {
  type: "mpesa" | "telebirr" | "both";
  size?: "sm" | "md";
}

const ServiceBadge = ({ type, size = "sm" }: ServiceBadgeProps) => {
  const base = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  if (type === "both") {
    return (
      <div className="flex gap-1.5">
        <span className={cn(base, "rounded-full font-medium bg-mpesa-light text-mpesa")}>M-Pesa</span>
        <span className={cn(base, "rounded-full font-medium bg-telebirr-light text-telebirr")}>Telebirr</span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        base,
        "rounded-full font-medium",
        type === "mpesa" ? "bg-mpesa-light text-mpesa" : "bg-telebirr-light text-telebirr"
      )}
    >
      {type === "mpesa" ? "M-Pesa" : "Telebirr"}
    </span>
  );
};

export default ServiceBadge;
