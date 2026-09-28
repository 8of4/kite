import { useAppId } from "@/lib/hooks/params";
import { useCreditLimitsQuery } from "@/lib/api/queries";
import {
  useCreditLimitUpsertMutation,
  useCreditLimitDeleteMutation,
} from "@/lib/api/mutations";
import { useMemo, useState } from "react";
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

function useCreditLimitActions(appId: string) {
  const upsert = useCreditLimitUpsertMutation(appId);
  const remove = useCreditLimitDeleteMutation(appId);
  return { upsert, remove };
}

function DefaultLimitInput({
  appId,
  type,
  label,
  value,
}: {
  appId: string;
  type: "server" | "user";
  label: string;
  value: number;
}) {
  const { upsert, remove } = useCreditLimitActions(appId);
  const [input, setInput] = useState(value ? String(value) : "");

  function save() {
    const max = parseInt(input, 10);
    if (!input || isNaN(max) || max <= 0) {
      remove.mutate(
        { type, target_id: null },
        { onSuccess: () => toast.success("Limit removed") }
      );
      return;
    }
    upsert.mutate(
      { type, target_id: null, max_credits: max },
      { onSuccess: () => toast.success("Limit saved") }
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <div className="text-sm font-medium mb-1">{label}</div>
        <Input
          type="number"
          min={0}
          placeholder="No limit"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <Button onClick={save} disabled={upsert.isPending || remove.isPending}>
        Save
      </Button>
    </div>
  );
}

export default function AppCreditLimits() {
  const appId = useAppId();
  const { data } = useCreditLimitsQuery(appId);
  const limits = data?.success ? data.data : undefined;
  const { upsert, remove } = useCreditLimitActions(appId);

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
      toast.error("Enter a target ID and a credit limit above 0");
      return;
    }
    upsert.mutate(
      { type: newType, target_id: newTarget.trim(), max_credits: max },
      {
        onSuccess: () => {
          toast.success("Override added");
          setNewTarget("");
          setNewMax("");
        },
      }
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 max-w-lg">
        <div className="text-sm text-muted-foreground">
          Default monthly credit limits applied to every server and user. Leave
          empty for no limit.
        </div>
        <DefaultLimitInput
          appId={appId}
          type="server"
          label="Per server"
          value={defaults.server}
        />
        <DefaultLimitInput
          appId={appId}
          type="user"
          label="Per user"
          value={defaults.user}
        />
      </div>

      <div className="space-y-3 max-w-2xl">
        <div className="text-lg font-semibold">Specific overrides</div>
        <div className="text-sm text-muted-foreground">
          Set a different monthly limit for a specific server or user by ID.
        </div>

        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <div className="text-sm font-medium mb-1">Type</div>
            <Select
              value={newType}
              onValueChange={(v) => setNewType(v as "server" | "user")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="server">Server</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-40">
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
            <div className="text-sm font-medium mb-1">Max credits</div>
            <Input
              type="number"
              min={0}
              value={newMax}
              onChange={(e) => setNewMax(e.target.value)}
            />
          </div>
          <Button onClick={addOverride} disabled={upsert.isPending}>
            Add
          </Button>
        </div>

        <div className="divide-y rounded-md border">
          {overrides.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              No overrides yet.
            </div>
          ) : (
            overrides.map((l) => (
              <div
                key={`${l?.type}:${l?.target_id}`}
                className="flex items-center justify-between p-3"
              >
                <div className="text-sm">
                  <span className="capitalize">{l?.type}</span>{" "}
                  <span className="text-muted-foreground">{l?.target_id}</span>
                  {" — "}
                  {l?.max_credits} credits / month
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
