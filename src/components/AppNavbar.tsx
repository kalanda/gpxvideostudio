import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Globe, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GithubIcon } from "@/components/GithubIcon";
import { Language } from "@/i18n";

type Theme = "light" | "dark";

type AppNavbarProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.EnglishUS]: "English",
  [Language.SpanishES]: "Español",
};

const LANGUAGE_SHORT: Record<Language, string> = {
  [Language.EnglishUS]: "EN",
  [Language.SpanishES]: "ES",
};

export const AppNavbar = ({ theme, onToggleTheme }: AppNavbarProps) => {
  const { t, i18n } = useTranslation();
  const isDark = theme === "dark";

  const currentLanguage = (i18n.language ?? Language.EnglishUS) as Language;

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
        <NavbarItem className="flex items-center gap-1">
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="light"
                aria-label={t("navbar.languageAriaLabel")}
                startContent={<Globe size={16} />}
                className="text-foreground"
              >
                {LANGUAGE_SHORT[currentLanguage] ?? currentLanguage}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={[currentLanguage]}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const lang = Array.from(keys)[0] as Language;
                if (lang) i18n.changeLanguage(lang);
              }}
            >
              {Object.values(Language).map((lang) => (
                <DropdownItem key={lang}>{LANGUAGE_LABELS[lang]}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            as={Link}
            href="https://github.com/kalanda/gpxvideostudio"
            isExternal
            isIconOnly
            variant="light"
            aria-label={t("navbar.githubAriaLabel")}
            className="text-foreground"
          >
            <GithubIcon size={20} />
          </Button>
          <Button
            isIconOnly
            variant="light"
            aria-label={
              isDark ? t("navbar.switchToLight") : t("navbar.switchToDark")
            }
            onPress={onToggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};
