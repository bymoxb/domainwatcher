import { Link, Text } from "@radix-ui/themes";
import ThemeButton from "./theme.button";

export default function Footer() {
  return (
    <footer className="min-h-12 flex justify-center items-center gap-4">
      <ThemeButton />
      <Text>
        Open source project on{" "}
        <Link
          href="https://github.com/bymoxb/domainwatcher"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Link>
      </Text>
    </footer>
  );
}
