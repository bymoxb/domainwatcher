import Input from "@/components/input";
import type { RegistryResponse } from "@/types/registry.type";
import type { WatcherResponse } from "@/types/watcher.type";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Callout,
  Flex,
  IconButton,
  Inset,
  Strong,
} from "@radix-ui/themes";
import React, { useActionState, useState } from "react";

type EmptyAction = null

export const ActionButtons: React.FunctionComponent<{ watcher: WatcherResponse, refresh?: () => void }> = ({ watcher: watcherOriginal, refresh }) => {

  const [watcher, setWatcher] = useState<WatcherResponse>(watcherOriginal)

  const [, actionRemove, pendingRemove] = useActionState<EmptyAction, FormData>(
    async (_p: EmptyAction, f: FormData) => {
      const watcherId = f.get("watcherId")?.toString() ?? ""
      await fetch("/api/watcher/:id".replace(":id", watcherId), { method: "DELETE" })
      if (refresh) refresh()
      return null
    },
    null
  );

  const [, actionSChanged, pendingSChanged] = useActionState<EmptyAction, FormData>(
    async (_p: EmptyAction, f: FormData) => {
      try {
        setWatcher((prev) => ({ ...prev, notificationEnabled: !prev.notificationEnabled }))
        const watcherId = f.get("watcherId")?.toString() ?? ""
        const raw = await fetch("/api/watcher/:id".replace(":id", watcherId), { method: "PATCH" })
        if (!raw.ok) {
          setWatcher(watcherOriginal)
          return null
        }
        return null
      } catch (error) {
        setWatcher(watcherOriginal)
        return null
      }
    },
    null
  );

  return (
    <>
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <IconButton color={watcher.notificationEnabled ? "blue" : "gray"}>
            {watcher.notificationEnabled ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </IconButton>
        </AlertDialog.Trigger>

        <AlertDialog.Content>
          <form action={actionSChanged}>
            <input type="hidden" name="watcherId" value={watcher.id} />
            <AlertDialog.Title>Alert</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to{" "}
              <Strong>
                {watcher.notificationEnabled
                  ? "disable notifications"
                  : "enable notifications"}
              </Strong>
              ?
            </AlertDialog.Description>

            <Flex gap="2" mt="4" justify="end">
              <AlertDialog.Cancel disabled={pendingSChanged}>
                <Button disabled={pendingSChanged} variant="surface">
                  Close
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  type="submit"
                  disabled={pendingSChanged}
                  loading={pendingSChanged}
                >
                  Accept
                </Button>
              </AlertDialog.Action>
            </Flex>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <IconButton color="red">
            <TrashIcon />
          </IconButton>
        </AlertDialog.Trigger>

        <AlertDialog.Content>
          <form action={actionRemove}>
            <input type="hidden" name="watcherId" value={watcher.id} />
            <AlertDialog.Title>Alert</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to remove{" "}
              <Strong>{watcher?.registry?.domain}</Strong>?
            </AlertDialog.Description>

            <Flex gap="2" mt="4" justify="end">
              <AlertDialog.Cancel disabled={pendingRemove}>
                <Button disabled={pendingRemove} variant="surface">
                  Close
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action>
                <Button
                  type="submit"
                  color="red"
                  disabled={pendingRemove}
                  loading={pendingRemove}
                >
                  Accept
                </Button>
              </AlertDialog.Action>
            </Flex>
          </form>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};

type NotifyAction = {
  message: string,
  ok?: boolean
}

export const NotifyButton = ({ registry }: { registry: RegistryResponse }) => {
  const [state, action, pending] = useActionState<NotifyAction, FormData>(async (_p: NotifyAction, form: FormData) => {
    try {
      const response = await fetch("/api/watcher", {
        method: "POST",
        body: form,

      });

      if (!response.ok) {
        const data = await response.json()

        return {
          ok: false,
          message: data.message ?? "Failed to subscribe",
        }
      }

      return {
        ok: true,
        message: "Subscription activated"
      }

    } catch (error) {
      return {
        ok: false,
        message: "Failed to subscribe",
      }
    }
  }, { message: "" });

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <IconButton>
          <BellIcon />
        </IconButton>
      </AlertDialog.Trigger>

      <AlertDialog.Content>
        <AlertDialog.Title>Subscribe to notifications</AlertDialog.Title>

        <Inset side="x" my="5" mx="5" px="0">
          <form action={action}>
            <input type="hidden" name="registry_id" value={registry.id} />
            <Input
              autoFocus
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />

            {state.ok != undefined && (
              <Callout.Root
                className="my-2"
                color={state.ok ? "blue" : "red"}
              >
                <Callout.Icon>
                  {state.ok ? (
                    <CheckIcon />
                  ) : (
                    <ExclamationTriangleIcon />
                  )}
                </Callout.Icon>
                <Callout.Text>{state.message}</Callout.Text>
              </Callout.Root>
            )}

            <Flex gap="2" mt="4" justify="end">
              <AlertDialog.Cancel disabled={pending}>
                <Button variant="surface">Close</Button>
              </AlertDialog.Cancel>
              {/* <AlertDialog.Action disabled={pending}> */}
              <Button type="submit" disabled={pending} loading={pending}>
                Accept
              </Button>
              {/* </AlertDialog.Action> */}
            </Flex>
          </form>
        </Inset>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
