# YapSpace (oder anderer Name)
Hier einige Notizen fürs Development.

## Ideen
(Grobe) Konzepte, was umgesetzt werden muss/kann.

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

#### Challenges beim AI-Processing
Es ist nicht direkt mit E2EE kompatibel,
der Server muss Zugriff auf die Plain-Text-Messages haben.

=> Alternativer Encryption-Modus, wenn dieses Feature
aktiviert ist.

=> Z.B. Shared Symmetric Key, der serverseitig gespeichert wird.
