import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";

type DetailProps = {
  type?: "alert";
  title?: string;
  className?: string;
} & React.PropsWithChildren;

export const Alert: React.FunctionComponent<DetailProps> = ({
  type = "alert",
  children,
  className,
  title,
}) => {
  return (
    <Callout.Root color="red" className={className}>
      <Callout.Icon>
        <ExclamationTriangleIcon></ExclamationTriangleIcon>
      </Callout.Icon>
      <Callout.Text>{children}</Callout.Text>
    </Callout.Root>
  );
};
