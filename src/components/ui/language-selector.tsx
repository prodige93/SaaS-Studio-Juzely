import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languageCodes = {
  fr: "FR",
  en: "EN",
  zh: "CH",
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1">
      {(Object.keys(languageCodes) as Language[]).map((lang) => (
        <Button
          key={lang}
          variant={language === lang ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage(lang)}
          className="px-2 py-1 text-xs"
        >
          {languageCodes[lang]}
        </Button>
      ))}
    </div>
  );
}