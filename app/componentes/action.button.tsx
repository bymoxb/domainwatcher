import { changeSubscription } from "@/actions/watcher.action";
import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
import { useActionState } from "react";
import Button from "./button";
import Input from "./input";

export default function ActionButtons({
  watcher,
}: {
  watcher: WatcherResponse;
}) {
  const [state, action, isSubmitting] = useActionState(changeSubscription, {
    ok: true,
    data: watcher,
  });

  const isSubscribed = state.ok && state.data.notificationEnabled;

  const buttonLabel = isSubmitting
    ? "Please wait..."
    : isSubscribed
    ? "Stop notifications"
    : "Get notified";

  return (
    <form className="w-full" action={action}>
      <Input
        hidden
        name="watcherId"
        value={state.ok ? state.data.id : ""}
        readOnly
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        loading={isSubmitting}
        label={buttonLabel}
        severity={isSubscribed ? "danger" : "success"}
        className="w-full"
      />
    </form>
  );
}
