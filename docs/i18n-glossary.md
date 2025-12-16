# i18n Glossary - The Glass Wall

This glossary defines terms that must be translated consistently across the application.
Terms marked as **LOCKED** must never be translated.

## Locked Terms (Never Translate)

These technical terms remain in English across all locales:

| Term | Reason |
|------|--------|
| HTTP | Protocol name |
| HTTPS | Protocol name |
| VPN | Acronym |
| TLS | Protocol name |
| SSL | Protocol name (legacy) |
| DNS | Protocol name |
| TCP | Protocol name |
| POST | HTTP method |
| GET | HTTP method |
| Set-Cookie | HTTP header |
| IP | Acronym |
| Wi-Fi | Brand/technology name |

## Translated Terms (Consistency Required)

| English | Latvian (lv) | Russian (ru) | Context |
|---------|--------------|--------------|---------|
| Encryption | Šifrēšana | Шифрование | Data protection |
| Plaintext | Vienkāršs teksts | Открытый текст | Unencrypted data |
| Ciphertext | Šifrētais teksts | Зашифрованный текст | Encrypted data |
| Handshake | Rokasspiediens | Рукопожатие | TLS connection |
| Tunnel | Tunelis | Туннель | VPN tunnel |
| Request | Pieprasījums | Запрос | HTTP request |
| Response | Atbilde | Ответ | HTTP response |
| Connection | Savienojums | Соединение | Network connection |
| Metadata | Metadati | Метаданные | Request metadata |
| Public Wi-Fi | Publiskais Wi-Fi | Публичный Wi-Fi | Network type |
| Secure | Drošs | Безопасный | Security state |
| Vulnerable | Neaizsargāts | Уязвимый | Security state |
| Protected | Aizsargāts | Защищённый | Security state |

## UI Element Terms

| English | Latvian (lv) | Russian (ru) | Usage |
|---------|--------------|--------------|-------|
| Enable | Iespējot | Включить | Toggle on |
| Disable | Atspējot | Отключить | Toggle off |
| Start | Sākt | Начать | Begin action |
| Reset | Atiestatīt | Сбросить | Clear state |
| Continue | Turpināt | Продолжить | Next step |
| Learn more | Uzzināt vairāk | Подробнее | Info link |

## Translation Guidelines

1. **Consistency**: Always use the same translation for the same English term
2. **Context**: Consider the UI context (button vs heading vs description)
3. **Length**: Latvian/Russian may be 30-40% longer; test in UI
4. **Formality**: Use formal tone (Latvian: "Jūs" form, Russian: "Вы" form)
5. **Technical accuracy**: Preserve technical meaning; don't over-simplify

## Adding New Terms

When adding new translatable content:
1. Check this glossary first for existing translations
2. If term is new, add it here with proposed translations
3. Get native speaker review before merging
4. Update all three locale files consistently

## Quality Sign-off

Translation quality is reviewed by:
- **Latvian**: Native Latvian speaker (assign team member before production)
- **Russian**: Native Russian speaker (assign team member before production)

**Process:**
1. All translation PRs require review from assigned language owner
2. Use this glossary as the source of truth for term consistency
3. Run `npm run i18n:check` before merging any translation changes
4. All translation changes require review before production deployment

**Note:** Reviewer assignments should be finalized before production deployment. Update this section with actual names/contacts once assigned.
