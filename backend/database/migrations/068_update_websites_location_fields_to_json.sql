-- Migration: Update websites location fields to JSON for multiple selections
-- Created: 2025-12-05

-- Change location fields to JSON type to support multiple selections
ALTER TABLE websites ALTER COLUMN selected_continent TYPE JSON USING CASE
    WHEN selected_continent IS NULL THEN '[]'::json
    ELSE json_build_array(selected_continent)
END;

ALTER TABLE websites ALTER COLUMN selected_country TYPE JSON USING CASE
    WHEN selected_country IS NULL THEN '[]'::json
    ELSE json_build_array(selected_country)
END;

ALTER TABLE websites ALTER COLUMN selected_state TYPE JSON USING CASE
    WHEN selected_state IS NULL THEN '[]'::json
    ELSE json_build_array(selected_state)
END;