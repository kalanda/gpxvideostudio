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
    <Navbar
      isBordered
      maxWidth="full"
      classNames={{
        brand: "font-bold text-foreground",
        base: "py-0 h-12",
      }}
    >
      <NavbarContent justify="start">
        <NavbarBrand>GPX Video Studio</NavbarBrand>
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
