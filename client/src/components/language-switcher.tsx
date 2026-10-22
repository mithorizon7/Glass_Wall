import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("common");

  const languages = [
    { code: "en", name: t("english"), nativeName: t("languageNative.en") },
    { code: "lv", name: t("latvian"), nativeName: t("languageNative.lv") },
    { code: "ru", name: t("russian"), nativeName: t("languageNative.ru") },
  ];

  const languageCode = (i18n.resolvedLanguage ?? i18n.language).split("-")[0];
  const currentLanguage = languages.find((lang) => lang.code === languageCode) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-language-switcher">
          <Globe className="w-4 h-4 mr-2" />
          {currentLanguage.nativeName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            data-testid={`menu-item-language-${language.code}`}
            className={languageCode === language.code ? "bg-accent" : ""}
          >
            <span className="font-medium">{language.nativeName}</span>
            <span className="ml-2 text-muted-foreground text-xs">({language.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
