"use client";

import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/lib/billing/subscription-provider";
import { PLANS } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

interface PlanBadgeProps {
  className?: string;
  showTrial?: boolean;
}

/**
 * PlanBadge
 *
 * Displays the user's current plan as a badge.
 * Used in the dashboard top nav, sidebar, and settings.
 */
export function PlanBadge({ className, showTrial = true }: PlanBadgeProps) {
  const { planId, isTrialing, plan } = useSubscription();

  const planColorMap: Record<string, string> = {
    starter: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    professional: "bg-primary/10 text-primary border-primary/20",
    enterprise: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const planName = plan?.name || PLANS[planId]?.name || "Starter";

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn(
          "font-medium",
          planColorMap[planId] || planColorMap.starter,
          className
        )}
      >
        {planName}
      </Badge>
      {showTrial && isTrialing && (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-medium"
        >
          Trial
        </Badge>
      )}
    </span>
  );
}
