import AppLayout from "@/components/app/AppLayout";
import AppCreditLimits from "@/components/app/AppCreditLimits";
import { Separator } from "@/components/ui/separator";

const breadcrumbs = [
  {
    label: "Credit Limits",
  },
];

export default function AppCreditLimitsPage() {
  return (
    <AppLayout title="Credit Limits" breadcrumbs={breadcrumbs}>
      <div>
        <h1 className="text-lg font-semibold md:text-2xl mb-1">Credit Limits</h1>
        <p className="text-muted-foreground text-sm">
          Cap how many credits a single server or user can spend each month. When
          a limit is reached, the bot stops running flows for that server or user
          until the next month.
        </p>
      </div>
      <Separator className="my-8" />
      <AppCreditLimits />
    </AppLayout>
  );
}
