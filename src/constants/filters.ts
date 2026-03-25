export const FILTER_CONSTANTS = {
  SORT_OPTIONS: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date (newest first)' }
  ],
  DATE_OPTIONS: [
    { value: 'any', label: 'Any time' },
    { value: '2026', label: 'Since 2026' },
    { value: '2025', label: 'Since 2025' },
    { value: '2024', label: 'Since 2024' },
    { value: '2023', label: 'Since 2023' },
    { value: '2022', label: 'Since 2022' },
    { value: '5years', label: 'Last 5 years' },
    { value: '10years', label: 'Last 10 years' }
  ],
  TYPE_OPTIONS: [
    { value: 'articles', label: 'Articles' },
    { value: 'books', label: 'Books' },
    { value: 'patents', label: 'Patents' },
    { value: 'case-law', label: 'Case law' }
  ],
  LANGUAGE_OPTIONS: [
    { value: 'any', label: 'Any language' },
    { value: 'en', label: 'English' },
    { value: 'zh', label: 'Chinese' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ]
};

// Environment-based debugging
export const DEBUG = import.meta.env.DEV;
