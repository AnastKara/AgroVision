import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { checkAccess } from "@/lib/billing/require-access";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce auth + email verification + active subscription on the server.
  // This is defense in depth on top of the middleware (proxy.ts) gate.
  const access = await checkAccess();

  if (!access.allowed) {
    if (access.reason === "unauthorized") {
      redirect("/login");
    }
    if (access.reason === "unverified") {
      redirect("/verify-email");
    }
    // inactive_subscription (or any other denial) → pricing
    redirect("/pricing?accessDenied=true");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

