import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Moon, Sun } from "lucide-react";

import { GithubIcon } from "@/components/GithubIcon";

type Theme = "light" | "dark";

type AppNavbarProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

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
        <NavbarBrand>
          <span className="font-display text-base font-bold tracking-tight text-primary">
            GPX
          </span>
          <span className="ml-1.5 font-display text-base font-medium tracking-tight text-foreground/50">
            Video Studio
          </span>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            as={Link}
            href="https://github.com/kalanda/gpxvideostudio"
            isExternal
            isIconOnly
            variant="light"
            aria-label="GitHub repository"
            className="text-foreground"
          >
            <GithubIcon size={20} />
          </Button>
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
