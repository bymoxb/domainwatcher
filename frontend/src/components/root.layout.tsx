import { Container, Theme } from "@radix-ui/themes";
import Footer from "./footer";

const RootLayout: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Theme
      radius="full"
      appearance="dark"
      accentColor="blue"
    >
      <Container size="4">
        {children}
        <Footer />
      </Container>
    </Theme>
  );
};

export default RootLayout;
