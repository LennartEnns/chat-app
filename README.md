# Chatapult (oder anderer Name)
Hier einige Notizen fürs Development.

## Ideen
(Grobe) Konzepte, was umgesetzt werden muss/kann.

### Rate Limiter für Edge Functions
Mehr Infos hier: https://supabase.com/docs/guides/functions/examples/rate-limiting

Redis ist auch nützlich für Caching, inkl. LLM-Cache.

### E2EE (End-to-End-Encryption)
Im Grunde PKI. In Group-Chats Sender-Keys benutzen.

### AI für Topic Tracking/Fragen
Inkrementelle Generierung von "Abschnitten" und Summaries für jeden Abschnitt.
(Z.B. alle *n* Messages oder alle *m* Minuten)

Die Summaries werden in einem Vectorstore embedded.

Zwischendurch werden evtl. Abschnitte "gemerged" bzw. hierarchisiert,
um sie besser zu strukturieren und einzuordnen.

Ermöglicht:
- Semantic Search nach Abschnitten
- RAG-Integration für inhaltliche Fragen
- Mind-Map-Darstellung der Themen
  => Sehr effizienter Überblick über alle Themen
