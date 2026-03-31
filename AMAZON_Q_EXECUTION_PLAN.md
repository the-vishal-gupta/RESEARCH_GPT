# ResearchGPT - Amazon Q Execution Plan
## Detailed Implementation Guide for AI Agents

**Project Status**: Core paper fetching fixed ✅ | UI z-index fixed ✅ | Ready for feature expansion

---

## 📊 PRIORITY MATRIX

### PRIORITY 1 (High Impact, Essential) - Est. 8k tokens
1. Fix Citations Not Showing Problem
2. Implement User Authentication/Login
3. Save Papers to Library Feature
4. Mobile Responsiveness Improvements

### PRIORITY 2 (Medium Impact, Nice-to-Have) - Est. 12k tokens
5. Advanced Paper Filtering
6. Paper Recommendations Engine
7. Export Papers (BibTeX, CSV)
8. Search History & Favorites

### PRIORITY 3 (Polish & Performance) - Est. 5k tokens
9. Performance Optimization
10. Dark Mode
11. Accessibility Improvements
12. Admin Dashboard

---

## 🎯 DETAILED TASK BREAKDOWN

### TASK 1: FIX CITATIONS NOT SHOWING (CRITICAL)
**Problem**: arXiv papers return 0 citations because they're brand new. Semantic Scholar API sometimes doesn't have citation data.

**Root Cause**:
- Line in `src/services/api/arxiv.ts:72` sets `citations: 0`
- Citation enrichment in `src/services/llm/citationEnrichment.ts` tries to fetch but often fails
- Display still shows "Cited by 0" which looks broken

**Solution Approach**:
1. Don't show "Cited by X" if citations = 0
2. Implement Semantic Scholar batch citation lookup
3. Add citation estimation algorithm for new papers
4. Show "Not yet cited" instead of "0 citations"

**Files to Modify**:
```
src/components/PaperCard.tsx - Line 215-225 (hide "Cited by" if 0)
src/services/llm/citationEnrichment.ts - Add batch lookup
src/types/index.ts - Add `estimatedCitations?: number`
```

**Implementation Steps**:
1. **Step 1**: Update PaperCard to conditionally show citations
   ```tsx
   // CHANGE: Line 215-225 in PaperCard.tsx
   // FROM:
   {paper.citations > 0 && (
     <a href="#" className="text-sm gs-green hover:underline">
       Cited by {formatCitations(paper.citations)}
     </a>
   )}

   // TO:
   {paper.citations > 0 ? (
     <a href="#" className="text-sm gs-green hover:underline">
       Cited by {formatCitations(paper.citations)}
     </a>
   ) : (
     <span className="text-sm text-[#9aa0a6] italic">
       Citation data not available yet
     </span>
   )}
   ```

2. **Step 2**: Improve citation enrichment batch lookup in `citationEnrichment.ts`
   - Create batch requests to Semantic Scholar instead of single requests
   - Use `/graph/v1/paper/search` with multiple papers
   - Cache results to avoid duplicate API calls

3. **Step 3**: Add citation estimation logic
   - Papers from 2024: estimate 0-5 citations
   - Papers from 2023: estimate 5-15 citations
   - Papers from 2022: estimate 15-50 citations
   - Older papers: use actual citation count

**Testing**:
- Search "transformer attention" (2017, should show high citations)
- Search "diffusion models" (2022-2024, may show 0)
- Verify "Citation data not available yet" displays instead of 0

---

### TASK 2: IMPLEMENT USER AUTHENTICATION/LOGIN
**Current State**: No authentication, all users are "Researcher User"

**Implementation**:
1. Create Authentication System
2. Add User Profiles
3. Persist User Data
4. Secure API Access

**Files to Create**:
```
src/services/auth/authService.ts (NEW)
src/pages/LoginPage.tsx (NEW)
src/pages/SignupPage.tsx (NEW)
src/context/AuthContext.tsx (NEW)
src/hooks/useAuth.ts (NEW)
```

**Database Schema** (use localStorage for MVP, can migrate to backend):
```typescript
// User in localStorage: "users"
{
  id: "uuid",
  email: "user@university.edu",
  password: "hashed_password", // use bcryptjs
  name: "John Doe",
  affiliation: "MIT",
  createdAt: "2024-03-31",
  preferences: {
    theme: "light",
    defaultSearchFilter: "relevance"
  }
}

// Saved Papers in localStorage: "user_papers_{userId}"
{
  paperId: "arxiv-123",
  savedAt: "2024-03-31",
  tags: ["AI", "ML"],
  notes: "Important paper about transformers"
}
```

**Implementation Steps**:

1. **Step 1**: Create Auth Service
```typescript
// src/services/auth/authService.ts
import bcryptjs from 'bcryptjs';

export const authService = {
  signup: async (email: string, password: string, name: string) => {
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const newUser = {
      id: crypto.randomUUID(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      preferences: { theme: 'light', defaultSearchFilter: 'relevance' }
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, email, name }));

    return { id: newUser.id, email, name };
  },

  login: async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (!user) throw new Error('User not found');

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) throw new Error('Invalid password');

    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    }));

    return { id: user.id, email: user.email, name: user.name };
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
  }
};
```

2. **Step 2**: Create LoginPage
```typescript
// src/pages/LoginPage.tsx
// Standard login form with:
// - Email input
// - Password input
// - "Don't have account? Sign up" link
// - Error handling
// - Loading state
// Navigate to home on success
```

3. **Step 3**: Create Auth Context
```typescript
// src/context/AuthContext.tsx
// Provide:
// - currentUser
// - login function
// - logout function
// - signup function
// - isLoading
// - error
```

4. **Step 4**: Update Header to show user, logout button
5. **Step 5**: Update App.tsx to require login for search/labs

**Files to Modify**:
```
src/App.tsx - Add auth check, redirect to login
src/components/Header.tsx - Show logout button, user name
src/sections/HomePage.tsx - Add sign up CTA if logged out
```

---

### TASK 3: SAVE PAPERS TO LIBRARY FEATURE
**Current State**: "Save to library" toast shows, but nothing happens

**Implementation**:
1. Create Library Storage (localStorage)
2. Update PaperCard Save Button
3. Update LibraryPage to Show Saved Papers
4. Add Search/Filter in Library

**Storage Structure**:
```typescript
localStorage["library_{userId}"] = [
  {
    paperId: "arxiv-123",
    title: "Attention Is All You Need",
    authors: ["Vaswani, A."],
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
    savedAt: "2024-03-31T10:30:00Z",
    notes: "Fundamental transformer paper",
    tags: ["attention", "NLP", "architecture"],
    rating: 5
  }
]
```

**Implementation Steps**:

1. **Step 1**: Create Library Service
```typescript
// src/services/libraryService.ts
export const libraryService = {
  savePaper: (userId: string, paper: Paper) => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]');

    // Check if already saved
    if (library.some((p: any) => p.paperId === paper.id)) {
      throw new Error('Paper already saved');
    }

    library.push({
      paperId: paper.id,
      title: paper.title,
      authors: paper.authors,
      pdfUrl: paper.pdfUrl,
      savedAt: new Date().toISOString(),
      publication: paper.publication,
      year: paper.year,
      notes: '',
      tags: [],
      rating: 0
    });

    localStorage.setItem(key, JSON.stringify(library));
  },

  getSavedPapers: (userId: string) => {
    const key = `library_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  removePaper: (userId: string, paperId: string) => {
    const key = `library_${userId}`;
    const library = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = library.filter((p: any) => p.paperId !== paperId);
    localStorage.setItem(key, JSON.stringify(updated));
  },

  updateNotes: (userId: string, paperId: string, notes: string) => {
    // Similar pattern
  },

  addTags: (userId: string, paperId: string, tags: string[]) => {
    // Similar pattern
  },

  setRating: (userId: string, paperId: string, rating: number) => {
    // Similar pattern
  }
};
```

2. **Step 2**: Update PaperCard.tsx
```typescript
// Line 42-45: Update handleSave to use libraryService
const handleSave = () => {
  setSaved(!saved);
  const user = useAuth();
  if (saved) {
    libraryService.removePaper(user.id, paper.id);
  } else {
    libraryService.savePaper(user.id, paper);
  }
  onSave?.(paper);
};
```

3. **Step 3**: Update LibraryPage.tsx
```typescript
// Show all saved papers with:
// - Search/filter
// - Sort by date/rating/title
// - View notes
// - Delete button
// - Open PDF button
```

4. **Step 4**: Add Library Features
- Search saved papers
- Filter by tags
- Sort by saved date, rating, title
- Add/edit notes for each paper
- Rate papers (1-5 stars)

---

### TASK 4: MOBILE RESPONSIVENESS IMPROVEMENTS
**Current Issue**: Some UI elements don't scale well on mobile

**Files to Check & Fix**:
```
src/sections/HomePage.tsx - Hero section
src/sections/SearchResultsPage.tsx - Filters sidebar
src/components/Header.tsx - Mobile menu
src/components/SearchBar.tsx - Input sizing
src/components/PaperCard.tsx - Action button layout
```

**Implementation**:

1. **Homepage Mobile**:
   - Make hero section text responsive
   - Stack buttons vertically on small screens
   - Adjust card layout for mobile

2. **Search Results Mobile**:
   - Hide filters sidebar, add mobile filter button
   - Make action buttons smaller on mobile
   - Adjust pagination

3. **SearchBar Mobile**:
   - Remove Labs button on mobile
   - Make search button icon-only on small screens
   - Adjust padding/sizing

**Tests**:
- View on iPhone (375px)
- View on iPad (768px)
- View on Desktop (1920px)
- Test all interactions

---

### TASK 5: ADVANCED PAPER FILTERING
**Current Filters**: Sort, date range, type, language, open access

**New Filters**:
1. Citation range (e.g., 100-1000 citations)
2. Author search
3. Journal/venue filter
4. Paper type (research, review, preprint)
5. Subject/category (CS, Physics, Biology)
6. Publication date exact range

**Implementation**:
```typescript
// src/components/Filters.tsx - Add new filter inputs
interface SearchFilters {
  sortBy: 'relevance' | 'citations' | 'date';
  dateRange: 'any' | '5years' | '10years' | string;
  type: 'articles' | 'all';
  language: 'any' | 'english';
  openAccessOnly: boolean;
  citationMin?: number;
  citationMax?: number;
  author?: string;
  venue?: string;
  category?: string;
}
```

**UI Changes**:
- Add sliders for citation range
- Add author search input
- Add category checkboxes
- Show filter count badge

---

### TASK 6: PAPER RECOMMENDATIONS ENGINE
**Concept**: Show "Similar papers" or "Recommended for you"

**Implementation**:
1. Track papers user views/saves
2. Extract keywords from those papers
3. Recommend similar papers based on:
   - Keywords overlap
   - Same authors
   - Same venue/journal
   - Citation relationships

**Algorithm**:
```typescript
// src/services/recommendationService.ts
export const getRecommendations = (userId: string): Paper[] => {
  // 1. Get user's saved papers
  // 2. Extract keywords from titles + abstracts
  // 3. Calculate keyword frequency
  // 4. Search for papers with matching keywords
  // 5. Rank by relevance + citation count
  // 6. Return top 5
};
```

**UI**:
- Homepage: "Recommended for you" section
- Paper card: "Similar papers" link
- Recommendations page: Full list with explanations

---

### TASK 7: EXPORT PAPERS FEATURE
**Formats**:
1. BibTeX (for LaTeX/Overleaf)
2. CSV (for spreadsheets)
3. RIS (for reference managers)
4. JSON (for custom tools)

**Implementation**:
```typescript
// src/services/exportService.ts
export const exportPapers = (papers: Paper[], format: 'bibtex' | 'csv' | 'ris' | 'json') => {
  return format === 'bibtex' ? generateBibTeX(papers) :
         format === 'csv' ? generateCSV(papers) :
         format === 'ris' ? generateRIS(papers) :
         JSON.stringify(papers, null, 2);
};

// Generate BibTeX
const generateBibTeX = (papers: Paper[]) => {
  return papers.map(p => {
    const arxivId = p.doi?.split('/')[1] || p.id;
    return `@article{${arxivId},
  title={${p.title}},
  author={${p.authors.join(' and ')}},
  year={${p.year}},
  journal={${p.publication}}}`;
  }).join('\n\n');
};
```

**UI**:
- Library page: "Export" button (dropdown: BibTeX, CSV, etc.)
- Paper card: "Cite" button (BibTeX, APA, MLA)
- Batch export from search results

---

### TASK 8: SEARCH HISTORY & FAVORITES
**Features**:
1. Save recent searches
2. Mark searches as favorites
3. Quick access to past searches
4. Search suggestions from history

**Storage**:
```typescript
localStorage["search_history_{userId}"] = [
  { query: "machine learning", timestamp: "2024-03-31T10:00", count: 15 },
  { query: "transformers attention", timestamp: "2024-03-31T09:30", count: 28 }
]

localStorage["favorite_searches_{userId}"] = [
  { query: "deep learning neural networks", color: "blue" }
]
```

**Implementation**:
1. Track searches in `SearchResultsPage`
2. Show history in SearchBar dropdown
3. Allow favorite/unfavorite searches
4. Show quick access buttons on homepage

---

### TASK 9: PERFORMANCE OPTIMIZATION
**Issues to Address**:
1. Large paper lists (pagination working, but slow rendering)
2. API calls (implement caching)
3. Image loading (lazy load)
4. Bundle size (code splitting)

**Implementation**:

1. **Caching Layer**:
```typescript
// src/services/cacheService.ts
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCached = (key: string) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.value;
  }
  cache.delete(key);
  return null;
};

export const setCached = (key: string, value: any) => {
  cache.set(key, { value, timestamp: Date.now() });
};
```

2. **React.memo for costly components**:
   - Already applied to PaperCard
   - Apply to Filters, Header
   - Use useMemo for filtered/sorted results

3. **Code splitting**:
   - Lazy load LabsPage, LibraryPage, CitationsPage

4. **Image optimization**:
   - Use webp format
   - Lazy load paper thumbnails

---

### TASK 10: DARK MODE
**Implementation**:
1. Use `next-themes` (already installed)
2. Update Tailwind config for dark mode
3. Add toggle in Header
4. Persist preference in localStorage

**Files**:
```typescript
// src/App.tsx - Wrap with ThemeProvider
// src/components/Header.tsx - Add theme toggle
// src/App.css - Add dark mode colors
```

**Color Scheme**:
```
Dark mode:
- Background: #121212
- Cards: #1e1e1e
- Text: #e0e0e0
- Accent: #4285f4 (keep same)
- Borders: #333333
```

---

## 📋 SUMMARY OF ALL TASKS

| Task | Priority | Tokens | Status |
|------|----------|--------|--------|
| 1. Fix Citations | P1 | 2k | Pending |
| 2. Auth/Login | P1 | 3.5k | Pending |
| 3. Save Papers | P1 | 1.5k | Pending |
| 4. Mobile Responsive | P1 | 1.5k | Pending |
| 5. Advanced Filters | P2 | 2k | Pending |
| 6. Recommendations | P2 | 3k | Pending |
| 7. Export Papers | P2 | 2.5k | Pending |
| 8. Search History | P2 | 2.5k | Pending |
| 9. Performance | P3 | 2k | Pending |
| 10. Dark Mode | P3 | 1.5k | Pending |
| 11. Accessibility | P3 | 1.5k | Pending |
| 12. Admin Dashboard | P3 | 2k | Pending |
| **TOTAL** | | **~29k** | |

---

## 🚀 RECOMMENDED EXECUTION ORDER FOR AMAZON Q

**Phase 1 (Highest ROI)**: Tasks 1, 2, 3
- Fix citations + fix UX (Task 1)
- Add auth so users own their data (Task 2)
- Let users save papers (Task 3)
- Estimate: ~7k tokens, ~3-4 hours

**Phase 2 (Feature Complete)**: Tasks 4, 5, 8
- Mobile improvements (Task 4)
- Better filtering (Task 5)
- Search history (Task 8)
- Estimate: ~6k tokens, ~2-3 hours

**Phase 3 (Polish)**: Tasks 6, 7, 9, 10
- Recommendations (Task 6)
- Export (Task 7)
- Performance (Task 9)
- Dark mode (Task 10)
- Estimate: ~9k tokens, ~3-4 hours

**Phase 4 (Nice-to-Have)**: Tasks 11, 12
- Accessibility & Admin
- Estimate: ~3k tokens, ~1-2 hours

---

## ✅ SUCCESS CRITERIA

After completing each task, verify:

**Task 1 (Citations)**:
- ✅ "Cited by X" shows when X > 0
- ✅ "Citation data not available yet" shows when X = 0
- ✅ No console errors with Semantic Scholar API

**Task 2 (Auth)**:
- ✅ Can create account with email
- ✅ Can login/logout
- ✅ Sessions persist on refresh
- ✅ Logged-in user shown in Header

**Task 3 (Library)**:
- ✅ "Save to library" button works
- ✅ Saved papers show in Library page
- ✅ Can remove papers from library
- ✅ Can add notes and tags

**Task 4 (Mobile)**:
- ✅ Works on iPhone (375px)
- ✅ Works on iPad (768px)
- ✅ All buttons clickable
- ✅ Text readable (no overflow)

---

## 🔧 QUICK START FOR AMAZON Q

When you give this to Amazon Q, tell it:

> "Execute Task 1 first (Fix Citations). Follow the implementation steps exactly. Use the code examples provided. Test using the success criteria. Report any errors you encounter. When done, move to Task 2."

This gives Amazon Q:
- ✅ Clear objective
- ✅ Step-by-step instructions
- ✅ Code examples
- ✅ Testing procedures
- ✅ Success criteria

---

## 📞 EXPECTED ERRORS & SOLUTIONS

**If Amazon Q encounters bcryptjs error**:
- Make sure to `npm install bcryptjs` first
- Import: `import bcryptjs from 'bcryptjs';`

**If localStorage quota exceeded**:
- Implement IndexedDB instead of localStorage
- Add cleanup for old data (>1 month)

**If Semantic Scholar API times out**:
- Increase timeout to 15s
- Add fallback: estimate citations by year

**If mobile buttons overflow**:
- Use `flex-wrap` and smaller `px` values
- Test on actual device, not just browser dev tools

---

## 📚 REFERENCE FILES ALREADY CREATED

Your project already has:
- ✅ Backend proxy (`server.js`)
- ✅ API services (arXiv, Semantic Scholar, CORE)
- ✅ UI components (SearchBar, PaperCard, etc.)
- ✅ Setup guides (FIXES_AND_SETUP.md, AUDIT_AND_FIX_REPORT.md)

Amazon Q should **modify these existing files**, not create from scratch.

---

## 💡 TIPS FOR AMAZON Q

1. **Always test after changes** - Don't batch multiple changes, test after each file
2. **Check console for errors** - Some changes need imports or dependencies
3. **Use the existing patterns** - Follow code style already in project
4. **Don't over-engineer** - Keep solutions simple and focused
5. **Reference line numbers** - Makes changes trackable and reversible

Good luck! This plan should keep Amazon Q productive for the full 30k tokens. 🚀
