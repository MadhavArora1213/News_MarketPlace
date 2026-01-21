import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

// Global cache to store translations across the entire session
// Key: `${text}_${targetLang}`, Value: translatedText
// This cache is cleared on every language change to force fresh API calls
let translationMemory = new Map();

// Track pending requests to prevent duplicate API calls for same text
let pendingRequests = new Map();

// Track the current language globally to detect language changes
let currentGlobalLanguage = 'en';

// Max characters per chunk for translation (API limit is 5000, use 4000 to be safe)
const MAX_CHUNK_SIZE = 4000;

/**
 * Strip HTML tags and return plain text for translation
 * Preserves paragraph structure by replacing block tags with newlines
 */
const stripHtmlForTranslation = (html) => {
    if (!html || typeof html !== 'string') return html;

    // Replace block-level tags with newlines to preserve structure
    let text = html
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/li>/gi, '\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    text = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    // Clean up excessive whitespace but preserve paragraph breaks
    text = text
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return text;
};

/**
 * Check if text contains HTML tags
 */
const containsHtml = (text) => {
    if (!text || typeof text !== 'string') return false;
    return /<[^>]+>/g.test(text);
};

/**
 * Split long text into chunks that can be translated
 * Tries to split at paragraph boundaries
 */
const splitIntoChunks = (text, maxSize = MAX_CHUNK_SIZE) => {
    if (!text || text.length <= maxSize) {
        return [text];
    }

    const chunks = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length + 2 <= maxSize) {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        } else {
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            // If single paragraph is too long, split by sentences
            if (paragraph.length > maxSize) {
                const sentences = paragraph.split(/(?<=[.!?])\s+/);
                currentChunk = '';
                for (const sentence of sentences) {
                    if (currentChunk.length + sentence.length + 1 <= maxSize) {
                        currentChunk += (currentChunk ? ' ' : '') + sentence;
                    } else {
                        if (currentChunk) chunks.push(currentChunk);
                        currentChunk = sentence;
                    }
                }
            } else {
                currentChunk = paragraph;
            }
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
};

/**
 * Force clear all translation caches - call this on language change
 */
export const forceResetTranslationCache = () => {
    console.log('🔄 Force clearing all translation caches...');
    translationMemory = new Map();
    pendingRequests = new Map();
};

/**
 * Custom hook for dynamic content translation
 * Translates text content that comes from APIs or user input
 * ALWAYS calls the Flask translator.py service on language change
 * @param {string} initialText - The initial text to translate
 * @param {boolean} autoTranslate - Whether to automatically translate on language change
 * @returns {object} - { translatedText, isTranslating, translateText, error }
 */
export const useTranslation = (initialText = '', autoTranslate = true) => {
    const { language } = useLanguage();
    const [translatedText, setTranslatedText] = useState(initialText);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    // Track the previous language to detect changes
    const prevLanguage = useRef(language);

    // Function to manually translate text - ALWAYS calls API (no cache check)
    const translateText = useCallback(async (text, targetLang = language, forceApi = false) => {
        if (!text || typeof text !== 'string' || text.trim() === '') {
            setTranslatedText(text);
            return text;
        }

        // If target is English, return original (no translation needed)
        if (targetLang === 'en') {
            setTranslatedText(text);
            return text;
        }

        const cacheKey = `${text}_${targetLang}`;

        // Only use cache if NOT forcing API call
        if (!forceApi && translationMemory.has(cacheKey)) {
            console.log('📦 Using cached translation for:', text.substring(0, 30));
            const cached = translationMemory.get(cacheKey);
            setTranslatedText(cached);
            return cached;
        }

        // Check if request is already pending (prevent duplicate calls for same text)
        if (pendingRequests.has(cacheKey)) {
            console.log('⏳ Waiting for pending translation:', text.substring(0, 30));
            const result = await pendingRequests.get(cacheKey);
            setTranslatedText(result);
            return result;
        }

        setIsTranslating(true);
        setError(null);

        console.log(`🌐 CALLING translator.py API: "${text.substring(0, 50)}..." → ${targetLang}`);

        // Create promise for this request
        const requestPromise = (async () => {
            try {
                const response = await api.post('/translation/translate', {
                    text,
                    targetLang,
                    sourceLang: 'en'
                });

                if (response.data && response.data.success) {
                    const result = response.data.translation;
                    console.log(`✅ Translation received: "${result.substring(0, 50)}..."`);
                    translationMemory.set(cacheKey, result);
                    return result;
                } else {
                    throw new Error(response.data?.error || 'Translation failed');
                }
            } catch (err) {
                console.error('❌ Translation error:', err);
                return text; // Return original on error
            } finally {
                pendingRequests.delete(cacheKey);
            }
        })();

        pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            setTranslatedText(result);
            return result;
        } catch (err) {
            setError(err);
            setTranslatedText(text);
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    // FORCE clear cache and retranslate when language changes
    useEffect(() => {
        if (prevLanguage.current !== language) {
            console.log(`🔄 Language changed: ${prevLanguage.current} → ${language}`);

            // Clear ALL caches on language change
            translationMemory.clear();
            pendingRequests.clear();
            currentGlobalLanguage = language;

            prevLanguage.current = language;

            // Force retranslate if we have text
            if (autoTranslate && initialText) {
                if (language === 'en') {
                    setTranslatedText(initialText);
                } else {
                    // Force API call
                    translateText(initialText, language, true);
                }
            }
        }
    }, [language, initialText, autoTranslate, translateText]);

    // Initial translation on mount or when text changes
    // ALWAYS call API when text changes and language is not English
    useEffect(() => {
        if (!autoTranslate || !initialText) return;

        if (language === 'en') {
            setTranslatedText(initialText);
        } else {
            // FORCE API call every time text changes
            console.log('📝 Text changed, forcing translation API call for language:', language);
            translateText(initialText, language, true); // forceApi = true
        }
    }, [initialText, language]); // Include language in dependencies

    return {
        translatedText,
        isTranslating,
        translateText,
        error
    };
};

/**
 * Custom hook for translating arrays of content
 * ALWAYS calls Flask translator.py on language change
 * @param {Array} items - Array of items to translate
 * @param {string|Array<string>} textKey - Key(s) in each item that contains the text to translate
 * @param {boolean} autoTranslate - Whether to automatically translate on language change
 * @returns {object} - { translatedItems, isTranslating, translateItems, error }
 */
export const useTranslationArray = (items = [], textKey = 'text', autoTranslate = true) => {
    const { language } = useLanguage();
    const [translatedItems, setTranslatedItems] = useState(items);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    // Track previous language
    const prevLanguage = useRef(language);
    const isProcessing = useRef(false);

    // Helper to normalize textKey to array
    const keys = useMemo(() => Array.isArray(textKey) ? textKey : [textKey], [textKey]);

    // Create a stable hash of items to detect changes
    const itemsHash = useMemo(() => {
        if (!items || items.length === 0) return '';
        return items.map(item => keys.map(k => item[k] || '').join('|')).join('||');
    }, [items, keys]);

    // Helper to construct results from cache/items
    const getMappedItems = useCallback((currentItems, lang) => {
        return currentItems.map(item => {
            const newItem = { ...item };

            keys.forEach(key => {
                const text = item[key];
                if (text && typeof text === 'string') {
                    const cacheKey = `${text}_${lang}`;
                    if (translationMemory.has(cacheKey)) {
                        newItem[key] = translationMemory.get(cacheKey);
                    }
                }
            });

            return newItem;
        });
    }, [keys]);

    const translateItems = useCallback(async (newItems = items, targetLang = language, forceApi = false) => {
        if (!Array.isArray(newItems) || newItems.length === 0) {
            setTranslatedItems(newItems);
            return newItems;
        }

        if (targetLang === 'en') {
            setTranslatedItems(newItems);
            return newItems;
        }

        // Prevent concurrent processing
        if (isProcessing.current) {
            console.log('⏳ Translation already in progress, skipping...');
            return translatedItems;
        }

        // Identify what actually needs translation
        const textsToTranslate = [];

        newItems.forEach((item) => {
            keys.forEach(key => {
                const text = item[key];
                if (text && typeof text === 'string') {
                    const cacheKey = `${text}_${targetLang}`;
                    // If forcing API, always add to translation list
                    // Otherwise, only add if not in cache
                    if (forceApi || (!translationMemory.has(cacheKey) && !pendingRequests.has(cacheKey))) {
                        if (!textsToTranslate.includes(text)) {
                            textsToTranslate.push(text);
                        }
                    }
                }
            });
        });

        // If nothing new to translate and not forcing, just apply cache
        if (!forceApi && textsToTranslate.length === 0) {
            const result = getMappedItems(newItems, targetLang);
            setTranslatedItems(result);
            return result;
        }

        isProcessing.current = true;
        setIsTranslating(true);
        setError(null);

        console.log(`🌐 CALLING translator.py BATCH API for ${textsToTranslate.length} items → ${targetLang}`);

        // Chunking logic to avoid payload size issues
        const BATCH_SIZE = 25;
        const translationPromises = [];

        // Split textsToTranslate into chunks
        for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
            const chunk = textsToTranslate.slice(i, i + BATCH_SIZE);
            console.log(`🌐 CALLING translator.py API for chunk ${i / BATCH_SIZE + 1} (${chunk.length} items)...`);

            const chunkPromise = api.post('/translation/translate/batch', {
                translations: chunk,
                targetLang,
                sourceLang: 'en'
            }).then(response => {
                if (response.data && (response.data.success || response.data.results)) {
                    return response.data;
                }
                throw new Error(response.data?.error || 'Batch chunk translation failed');
            });

            translationPromises.push(chunkPromise);
        }

        try {
            const responses = await Promise.all(translationPromises);

            let successCount = 0;
            responses.forEach(data => {
                if (data.results) {
                    successCount += data.results.length;
                    data.results.forEach(res => {
                        if (res.success || res.translation) {
                            const key = `${res.original_text || res.original}_${targetLang}`;
                            translationMemory.set(key, res.translation);
                        }
                    });
                }
            });

            console.log(`✅ All batches completed: ${successCount} total items translated`);
            const result = getMappedItems(newItems, targetLang);
            setTranslatedItems(result);
            return result;

        } catch (err) {
            console.error('❌ Batch translation error:', err);
            // Log more details if available
            if (err.response && err.response.data) {
                console.error('❌ Error details:', JSON.stringify(err.response.data));
            }

            setError(err);

            // Fallback: use original items (or partial results if memory was updated)
            const result = getMappedItems(newItems, targetLang);
            setTranslatedItems(result);
            return result;
        } finally {
            setIsTranslating(false);
            isProcessing.current = false;
        }
    }, [items, keys, language, getMappedItems, translatedItems]);

    // FORCE clear cache and retranslate when language changes
    useEffect(() => {
        if (prevLanguage.current !== language) {
            console.log(`🔄 Array: Language changed: ${prevLanguage.current} → ${language}`);

            // Clear ALL caches on language change
            translationMemory.clear();
            pendingRequests.clear();
            isProcessing.current = false;

            prevLanguage.current = language;

            // Force retranslate all items
            if (autoTranslate && items && items.length > 0) {
                if (language === 'en') {
                    setTranslatedItems(items);
                } else {
                    // Force API call with forceApi = true
                    translateItems(items, language, true);
                }
            }
        }
    }, [language, autoTranslate, items, translateItems]);

    // Initial translation on mount or when items change
    // ALWAYS call API when items change and language is not English
    useEffect(() => {
        if (!autoTranslate) return;

        if (!items || items.length === 0) {
            setTranslatedItems(items);
            return;
        }

        if (language === 'en') {
            setTranslatedItems(items);
            return;
        }

        // FORCE API call every time items change to ensure fresh translation
        console.log('📋 Items changed, forcing translation API call for language:', language);
        translateItems(items, language, true); // forceApi = true
    }, [itemsHash, language]); // Include language in dependencies

    return {
        translatedItems,
        isTranslating,
        translateItems,
        error
    };
};

/**
 * Custom hook for translating object properties
 * ALWAYS calls Flask translator.py on language change
 * @param {object} obj - Object to translate
 * @param {Array} translatableKeys - Array of keys that should be translated
 * @param {boolean} autoTranslate - Whether to automatically translate on language change
 * @returns {object} - { translatedObject, isTranslating, translateObject, error }
 */
export const useTranslationObject = (obj = {}, translatableKeys = [], autoTranslate = true) => {
    const { language } = useLanguage();
    const [translatedObject, setTranslatedObject] = useState(obj);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    // Track previous language
    const prevLanguage = useRef(language);
    const isProcessing = useRef(false);

    // Create a stable hash of object to detect changes
    const objHash = useMemo(() => {
        if (!obj) return '';
        return translatableKeys.map(k => obj[k] || '').join('|');
    }, [obj, translatableKeys]);

    const getMappedObject = useCallback((currentObj, lang) => {
        const newObj = { ...currentObj };
        translatableKeys.forEach(key => {
            const text = currentObj[key];
            if (text && typeof text === 'string') {
                const cacheKey = `${text}_${lang}`;
                if (translationMemory.has(cacheKey)) {
                    newObj[key] = translationMemory.get(cacheKey);
                }
            }
        });
        return newObj;
    }, [translatableKeys]);

    const translateObject = useCallback(async (newObj = obj, targetLang = language, forceApi = false) => {
        if (!newObj || typeof newObj !== 'object') {
            setTranslatedObject(newObj);
            return newObj;
        }

        if (targetLang === 'en') {
            setTranslatedObject(newObj);
            return newObj;
        }

        // Prevent concurrent processing
        if (isProcessing.current) {
            return translatedObject;
        }

        isProcessing.current = true;
        setIsTranslating(true);
        setError(null);

        try {
            const resultObj = { ...newObj };

            // Process each translatable key
            for (const key of translatableKeys) {
                const text = newObj[key];
                if (!text || typeof text !== 'string') continue;

                // Check cache first (unless forcing API)
                const cacheKey = `${text}_${targetLang}`;
                if (!forceApi && translationMemory.has(cacheKey)) {
                    resultObj[key] = translationMemory.get(cacheKey);
                    continue;
                }

                // Strip HTML from content before translation to avoid broken tags
                const textToTranslate = containsHtml(text) ? stripHtmlForTranslation(text) : text;
                const hadHtml = containsHtml(text);

                if (hadHtml) {
                    console.log(`🔧 Stripped HTML from "${key}" for clean translation`);
                }

                // Split long text into chunks
                const chunks = splitIntoChunks(textToTranslate);
                console.log(`📝 Key "${key}": ${textToTranslate.length} chars → ${chunks.length} chunk(s)`);

                if (chunks.length === 1 && chunks[0].length <= MAX_CHUNK_SIZE) {
                    // Single chunk - use batch API
                    try {
                        const response = await api.post('/translation/translate/batch', {
                            translations: [textToTranslate],  // Use HTML-stripped text
                            targetLang,
                            sourceLang: 'en'
                        });

                        if (response.data?.results?.[0]?.translation) {
                            const translation = response.data.results[0].translation;
                            resultObj[key] = translation;
                            translationMemory.set(cacheKey, translation);
                            console.log(`✅ Translated "${key}": "${translation.substring(0, 50)}..."`);
                        }
                    } catch (err) {
                        console.error(`❌ Failed to translate ${key}:`, err);
                    }
                } else {
                    // Multiple chunks - translate each and rejoin
                    console.log(`🔄 Translating ${chunks.length} chunks for "${key}"...`);
                    const translatedChunks = [];

                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];
                        const chunkCacheKey = `chunk_${i}_${chunk.substring(0, 50)}_${targetLang}`;

                        // Check chunk cache
                        if (translationMemory.has(chunkCacheKey)) {
                            translatedChunks.push(translationMemory.get(chunkCacheKey));
                            continue;
                        }

                        try {
                            const response = await api.post('/translation/translate/batch', {
                                translations: [chunk],
                                targetLang,
                                sourceLang: 'en'
                            });

                            if (response.data?.results?.[0]?.translation) {
                                const translatedChunk = response.data.results[0].translation;
                                translatedChunks.push(translatedChunk);
                                translationMemory.set(chunkCacheKey, translatedChunk);
                                console.log(`✅ Chunk ${i + 1}/${chunks.length} translated`);
                            } else {
                                translatedChunks.push(chunk); // Fallback to original
                            }
                        } catch (err) {
                            console.error(`❌ Chunk ${i + 1} translation failed:`, err);
                            translatedChunks.push(chunk); // Fallback to original
                        }

                        // Small delay between chunks to avoid rate limiting
                        if (i < chunks.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    }

                    // Rejoin translated chunks
                    const fullTranslation = translatedChunks.join('\n\n');
                    resultObj[key] = fullTranslation;
                    translationMemory.set(cacheKey, fullTranslation);
                    console.log(`✅ All ${chunks.length} chunks translated for "${key}"`);
                }
            }

            setTranslatedObject(resultObj);
            return resultObj;
        } catch (err) {
            console.error('❌ Object translation error:', err);
            setError(err);
            setTranslatedObject(newObj);
            return newObj;
        } finally {
            setIsTranslating(false);
            isProcessing.current = false;
        }
    }, [obj, translatableKeys, language, translatedObject]);

    // FORCE clear cache and retranslate when language changes
    useEffect(() => {
        if (prevLanguage.current !== language) {
            console.log(`🔄 Object: Language changed: ${prevLanguage.current} → ${language}`);

            // Clear ALL caches on language change
            translationMemory.clear();
            pendingRequests.clear();
            isProcessing.current = false;

            prevLanguage.current = language;

            // Force retranslate object
            if (autoTranslate && obj && Object.keys(obj).length > 0) {
                if (language === 'en') {
                    setTranslatedObject(obj);
                } else {
                    // Force API call
                    translateObject(obj, language, true);
                }
            }
        }
    }, [language, autoTranslate, obj, translateObject]);

    // Initial translation on mount or when object changes
    // ALWAYS call API when object changes and language is not English
    useEffect(() => {
        if (!autoTranslate) return;

        if (!obj || Object.keys(obj).length === 0) {
            setTranslatedObject(obj);
            return;
        }

        if (language === 'en') {
            setTranslatedObject(obj);
            return;
        }

        // FORCE API call every time object changes to ensure fresh translation
        console.log('📄 Object changed, forcing translation API call for language:', language);
        translateObject(obj, language, true); // forceApi = true
    }, [objHash, language]); // Include language in dependencies

    return {
        translatedObject,
        isTranslating,
        translateObject,
        error
    };
};

// Utility function to clear translation cache (useful for debugging)
export const clearTranslationCache = () => {
    console.log('🧹 Manually clearing translation cache...');
    translationMemory.clear();
    pendingRequests.clear();
};
