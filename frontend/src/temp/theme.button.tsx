"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeButton = () => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isLight = theme == "light";
  return (
    <IconButton
      variant="ghost"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
};

export default ThemeButton;
