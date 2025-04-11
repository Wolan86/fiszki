# Schema bazy danych dla Fiszki AI

## 1. Tabele

### users
Tabela zarządzana przez Supabase Auth.
```sql
-- Tabela users jest obsługiwana automatycznie przez Supabase Auth
-- Nie potrzebujemy dodatkowych pól niestandardowych w tej tabeli
```

### source_texts
```sql
CREATE TABLE source_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    CONSTRAINT content_min_length CHECK (length(content) >= 1000),
    CONSTRAINT content_max_length CHECK (length(content) <= 10000)
);

CREATE INDEX idx_source_texts_user_id ON source_texts(user_id);
```

### flashcards
```sql
CREATE TYPE flashcard_creation_type AS ENUM ('ai_generated', 'ai_edited', 'manual');

CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_text_id UUID REFERENCES source_texts(id) ON DELETE SET NULL,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    creation_type flashcard_creation_type NULL,
    accepted BOOLEAN DEFAULT TRUE,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    CONSTRAINT non_empty_front CHECK (length(front_content) > 0),
    CONSTRAINT non_empty_back CHECK (length(back_content) > 0),
    CONSTRAINT valid_generation_time CHECK (
        (creation_type IN ('ai_generated', 'ai_edited') AND generation_time_ms IS NOT NULL) OR
        (creation_type = 'manual' AND generation_time_ms IS NULL)
    ),
    CONSTRAINT valid_source_text CHECK (
        (creation_type IN ('ai_generated', 'ai_edited') AND source_text_id IS NOT NULL) OR
        (creation_type = 'manual')
    )
);

CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_source_text_id ON flashcards(source_text_id);
CREATE INDEX idx_flashcards_creation_type ON flashcards(creation_type);
```

## 2. Relacje między tabelami

- Relacja **1:N** między `users` i `source_texts` - jeden użytkownik może mieć wiele tekstów źródłowych
- Relacja **1:N** między `users` i `flashcards` - jeden użytkownik może mieć wiele fiszek
- Relacja **1:N** między `source_texts` i `flashcards` - jeden tekst źródłowy może być powiązany z wieloma fiszkami

## 3. Triggery

```sql
-- Trigger dla automatycznej aktualizacji pola updated_at przy modyfikacji fiszki
CREATE OR REPLACE FUNCTION update_flashcard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_flashcard_timestamp
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION update_flashcard_timestamp();
```

## 4. Funkcje

```sql
-- Funkcja do losowego wybierania fiszek bez powtórzeń w ramach jednej sesji
CREATE OR REPLACE FUNCTION get_random_flashcards(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS SETOF flashcards AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM flashcards
    WHERE user_id = p_user_id
    ORDER BY random()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

## 5. Polityki bezpieczeństwa (Row Level Security)

```sql
-- Włączenie RLS na tabelach
ALTER TABLE source_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Polityki dla source_texts
CREATE POLICY source_texts_select_policy ON source_texts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY source_texts_insert_policy ON source_texts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY source_texts_update_policy ON source_texts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY source_texts_delete_policy ON source_texts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Polityki dla flashcards
CREATE POLICY flashcards_select_policy ON flashcards
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY flashcards_insert_policy ON flashcards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY flashcards_update_policy ON flashcards
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY flashcards_delete_policy ON flashcards
    FOR DELETE
    USING (auth.uid() = user_id);
```

## 6. Dodatkowe uwagi

1. **Skalowalność**:
   - Indeksy na kolumnach `user_id` i `source_text_id` zapewnią szybkie wyszukiwanie związanych rekordów
   - Typ UUID dla kluczy podstawowych umożliwia rozproszoną generację kluczy bez konfliktów

2. **Bezpieczeństwo**:
   - Row Level Security (RLS) zapewnia, że użytkownicy mają dostęp tylko do swoich danych
   - Ograniczenia CHECK zapewniają integralność danych

3. **Implementacja**:
   - Losowy wybór fiszek bez powtórzeń będzie realizowany przez funkcję `get_random_flashcards`
   - W MVP nie przechowujemy odrzuconych fiszek, co jest realizowane przez domyślne `accepted = TRUE`
   - Monitorowanie czasu generowania fiszek przez AI jest możliwe dzięki polu `generation_time_ms`

4. **Przyszłe rozszerzenia**:
   - Struktura pozwala na łatwe dodanie kolekcji fiszek w przyszłości
   - Możliwe jest rozszerzenie o statusy "nauka" dla fiszek bez zmian w strukturze 