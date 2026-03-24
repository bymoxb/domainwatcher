import {
  changeSubscription,
  removeDomain,
  watchDomain,
} from "@/actions/watcher.action";
import { RegistryResponse } from "@/modules/registry/application/dtos/RegistryResponse";
import { WatcherResponse } from "@/modules/watcher/application/dtos/WatcherResponse";
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
import { useActionState, useEffect, useState } from "react";
import Input from "./input";

export const ActionButtons = ({ watcher }: { watcher: WatcherResponse }) => {
  const [stateRemove, actionRemove, pendingRemove] = useActionState(
    removeDomain,
    null
  );
  const [stateSChanged, actionSChanged, pendingSChanged] = useActionState(
    changeSubscription,
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

export const NotifyButton = ({ registry }: { registry: RegistryResponse }) => {
  const [state, action, pending] = useActionState(watchDomain, null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!state) return;

    if (state.ok) {
      setMessage({
        type: "success",
        text: "Subscription activated",
      });
    } else {
      setMessage({
        type: "error",
        text: state.message ?? "Failed to subscribe",
      });
    }

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <IconButton>
          <BellIcon />
        </IconButton>
      </AlertDialog.Trigger>

      <AlertDialog.Content>
        <AlertDialog.Title>Subscribe to notifications</AlertDialog.Title>
        {/* <AlertDialog.Description>Activate notification</AlertDialog.Description> */}

        <Inset side="x" my="5" mx="5" px="0">
          <form action={action}>
            <input type="hidden" name="registryId" value={registry.id} />
            <Input
              autoFocus
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />

            {message && (
              <Callout.Root
                className="my-2"
                color={message.type === "success" ? "blue" : "red"}
              >
                <Callout.Icon>
                  {message.type === "success" ? (
                    <CheckIcon />
                  ) : (
                    <ExclamationTriangleIcon />
                  )}
                </Callout.Icon>
                <Callout.Text>{message.text}</Callout.Text>
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
