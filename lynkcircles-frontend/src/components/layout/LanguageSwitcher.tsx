import { useTranslation } from "react-i18next";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { Languages } from "lucide-react";
import InputAdornment from "@mui/material/InputAdornment";

import { SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n";

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "en") as AppLocale;

  const labels: Record<AppLocale, string> = {
    en: t("language.english"),
    hi: t("language.hindi"),
    mr: t("language.marathi"),
  };

  return (
    <TextField
      select
      size="small"
      label={t("language.label")}
      value={current}
      onChange={(e) => {
        const next = e.target.value as AppLocale;
        void i18n.changeLanguage(next);
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Languages size={14} aria-hidden />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: 160 }}
    >
      {SUPPORTED_LOCALES.map((code) => (
        <MenuItem key={code} value={code} sx={{ fontSize: "0.8125rem" }}>
          {labels[code]}
        </MenuItem>
      ))}
    </TextField>
  );
};
