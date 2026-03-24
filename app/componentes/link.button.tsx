import { Link } from "@radix-ui/themes";

export default function LinkButton({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  return (
    <Link size="2" target="_blank" rel="noopener noreferrer" href={href}>
      {text}
    </Link>
  );
}
