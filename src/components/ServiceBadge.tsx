import { cn } from "@/lib/utils";

interface ServiceBadgeProps {
  type: "mpesa" | "telebirr" | "both";
  size?: "sm" | "md";
}

const ServiceBadge = ({ type, size = "sm" }: ServiceBadgeProps) => {
  const base = size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={cn(
        base,
        "rounded-full font-medium bg-telebirr-light text-telebirr"
      )}
    >
      Telebirr
    </span>
  );
};

export default ServiceBadge;
