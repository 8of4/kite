import { useAppId } from "@/lib/hooks/params";
import { useCreditLimitsQuery } from "@/lib/api/queries";
import {
  useCreditLimitUpsertMutation,
  useCreditLimitDeleteMutation,
} from "@/lib/api/mutations";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Trash2Icon } from "lucide-react";

function DefaultLimitRow({
  appId,
  type,
  title,
  description,
  value,
}: {
  appId: string;
  type: "server" | "user";
  title: string;
  description: string;
  value: number;
}) {
  const upsert = useCreditLimitUpsertMutation(appId);
  const remove = useCreditLimitDeleteMutation(appId);
  const [input, setInput] = useState(value ? String(value) : "");

  useEffect(() => {
    setInput(value ? String(value) : "");
  }, [value]);

  const dirty = (value ? String(value) : "") !== input.trim();

  function save() {
    const max = parseInt(input, 10);
    if (!input.trim() || isNaN(max) || max <= 0) {
      remove.mutate(
        { type, target_id: null },
        { onSuccess: () => toast.success(`${title} limit removed`) }
      );
      return;
    }
    upsert.mutate(
      { type, target_id: null, max_credits: max },
      { onSuccess: () => toast.success(`${title} limit saved`) }
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="font-medium text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground mb-3">{description}</div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          placeholder="Unlimited"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="max-w-40"
        />
        <span className="text-sm text-muted-foreground">credits / month</span>
        <Button
          className="ml-auto"
          onClick={save}
          disabled={!dirty || upsert.isPending || remove.isPending}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default function AppCreditLimits() {
  const appId = useAppId();
  const { data } = useCreditLimitsQuery(appId);
  const limits = data?.success ? data.data : undefined;

  const upsert = useCreditLimitUpsertMutation(appId);
  const remove = useCreditLimitDeleteMutation(appId);

  const [newType, setNewType] = useState<"server" | "user">("server");
  const [newTarget, setNewTarget] = useState("");
  const [newMax, setNewMax] = useState("");

  const defaults = useMemo(() => {
    const server = limits?.find((l) => l?.type === "server" && !l?.target_id);
    const user = limits?.find((l) => l?.type === "user" && !l?.target_id);
    return { server: server?.max_credits ?? 0, user: user?.max_credits ?? 0 };
  }, [limits]);

  const overrides = useMemo(
    () => (limits ?? []).filter((l) => !!l?.target_id),
    [limits]
  );

  function addOverride() {
    const max = parseInt(newMax, 10);
    if (!newTarget.trim() || isNaN(max) || max <= 0) {
      toast.error("Enter an ID and a credit limit above 0");
      return;
    }
    upsert.mutate(
      { type: newType, target_id: newTarget.trim(), max_credits: max },
      {
        onSuccess: () => {
          toast.success("Override saved");
          setNewTarget("");
          setNewMax("");
        },
      }
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Default limits
          </h2>
          <p className="text-sm text-muted-foreground">
            Applied to every server and every user, unless overridden below.
          </p>
        </div>
        <DefaultLimitRow
          appId={appId}
          type="server"
          title="Per server"
          description="Most credits any one server can spend each month."
          value={defaults.server}
        />
        <DefaultLimitRow
          appId={appId}
          type="user"
          title="Per user"
          description="Most credits any one user can spend each month."
          value={defaults.user}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Overrides
          </h2>
          <p className="text-sm text-muted-foreground">
            Set a different monthly limit for a specific server or user by its
            Discord ID. Overrides take priority over the defaults.
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-end gap-2 flex-wrap">
            <div>
              <div className="text-sm font-medium mb-1">Applies to</div>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as "server" | "user")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server">A server</SelectItem>
                  <SelectItem value="user">A user</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-44">
              <div className="text-sm font-medium mb-1">
                {newType === "server" ? "Server ID" : "User ID"}
              </div>
              <Input
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="123456789012345678"
              />
            </div>
            <div className="w-32">
              <div className="text-sm font-medium mb-1">Credits / month</div>
              <Input
                type="number"
                min={1}
                value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
              />
            </div>
            <Button onClick={addOverride} disabled={upsert.isPending}>
              Add
            </Button>
          </div>
        </div>

        {overrides.length > 0 && (
          <div className="divide-y rounded-lg border">
            {overrides.map((l) => (
              <div
                key={`${l?.type}:${l?.target_id}`}
                className="flex items-center justify-between p-3"
              >
                <div className="text-sm">
                  <span className="capitalize font-medium">{l?.type}</span>{" "}
                  <span className="text-muted-foreground">{l?.target_id}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    ({l?.max_credits} credits / month)
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    remove.mutate(
                      { type: l!.type, target_id: l!.target_id },
                      { onSuccess: () => toast.success("Override removed") }
                    )
                  }
                >
                  <Trash2Icon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
