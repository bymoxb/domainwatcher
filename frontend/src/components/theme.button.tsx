
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { IconButton, useThemeContext } from "@radix-ui/themes";

const ThemeButton = () => {
  const { onAppearanceChange, appearance } = useThemeContext();
  const isLight = appearance == "light";

  return (
    <IconButton
      variant="soft"
      onClick={() => onAppearanceChange(isLight ? "dark" : "light")}
    >
      {isLight ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
};

export default ThemeButton;
