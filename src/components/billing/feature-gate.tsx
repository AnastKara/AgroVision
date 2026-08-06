"use client";

import type { ReactNode } from "react";
import { useSubscription } from "@/lib/billing/subscription-provider";
import type { FeatureFlag, PlanId } from "@/lib/billing/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureGateProps {
  /** The feature required to access the content */
  feature?: FeatureFlag;
  /** Alternative: the minimum plan required */
  minPlan?: PlanId;
  /** The content to show when the user has access */
  children: ReactNode;
  /** Optional fallback content when the user doesn't have access */
  fallback?: ReactNode;
  /** Whether to show the upgrade prompt instead of the fallback */
  showUpgradePrompt?: boolean;
  /** Custom message for the upgrade prompt */
  message?: string;
}

/**
 * FeatureGate
 *
 * Wraps premium content and shows it only if the user's plan
 * includes the required feature or plan tier.
 *
 * Usage:
 *   <FeatureGate feature="ai_assistant">
 *     <AIComponent />
 *   </FeatureGate>
 *
 *   <FeatureGate minPlan="professional">
 *     <AdvancedReport />
 *   </FeatureGate>
 */
export function FeatureGate({
  feature,
  minPlan,
  children,
  fallback = null,
  showUpgradePrompt = false,
  message,
}: FeatureGateProps) {
  const { hasFeature, hasPlan } = useSubscription();
  const router = useRouter();

  const hasAccess = feature
    ? hasFeature(feature)
    : minPlan
    ? hasPlan(minPlan)
    : true;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Premium Feature
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            {message ||
              `This feature is available on the ${
                minPlan === "professional" ? "Professional" : "Enterprise"
              } plan or higher. Upgrade to unlock it.`}
          </p>
          <Button onClick={() => router.push("/pricing")}>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{fallback}</>;
}
