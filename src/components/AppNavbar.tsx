import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

interface AppNavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const AppNavbar = ({ theme, onToggleTheme }: AppNavbarProps) => {
  const isDark = theme === "dark";

  return (
    <Navbar isBordered maxWidth="full" className="shrink-0">
      <NavbarContent justify="start">
        <NavbarBrand>
          <span className="font-bold text-foreground">GPX Video</span>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onPress={onToggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
