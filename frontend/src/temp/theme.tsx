import { ThemeProvider } from "next-themes";
import { Container, Theme as ThemeRUI, ThemePanel } from "@radix-ui/themes";
import Nav from "./nav";
import Footer from "./footer";

const Theme: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <ThemeRUI
        radius="full"
        className="px-4"
        // appearance="light"
        accentColor="blue"
      >
        <Container size="4">
          <main className="flex flex-col overflow-hidden">
            <Nav />
            <main className="flex-1 h-full overflow-auto">{children}</main>
            <Footer />
          </main>
        </Container>
      </ThemeRUI>
    </ThemeProvider>
  );
};

export default Theme;
