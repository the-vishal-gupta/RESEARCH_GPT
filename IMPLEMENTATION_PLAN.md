# IMPLEMENTATION PLAN: 10 MILLION FREE RESEARCH PAPERS

## 🎯 GOAL
Build a system to search and access **10+ million free research papers** with **ZERO investment** (or minimal <$100).

---

## 📊 DATA SOURCES COMPARISON

| Source | Papers | Free PDFs | Metadata | Download | Storage | Cost |
|--------|--------|-----------|----------|----------|---------|------|
| **arXiv** | 2.4M | 2.4M (100%) | ✅ | Bulk S3 | 5 TB | $50 |
| **PubMed Central** | 8M | 8M (100%) | ✅ | FTP | 20 TB | FREE |
| **OpenAlex** | 250M | 50M (20%) | ✅ | S3 Snapshot | 10 GB metadata | FREE |
| **Semantic Scholar** | 200M | 60M (30%) | ✅ | API | 10 GB metadata | FREE |
| **CORE** | 300M | 30M (10%) | ✅ | Dataset | 10 GB metadata | FREE |
| **Unpaywall** | 30M | 30M (100%) | ✅ | API | On-demand | FREE |

**BEST COMBINATION:**
- **Metadata:** OpenAlex (250M papers, 10GB)
- **PDFs:** On-demand from Unpaywall API
- **Backup:** arXiv bulk download (2.4M papers, 5TB)

---

## 🏗️ ARCHITECTURE

### Current (Broken):
```
Frontend → VectorDB (broken) → APIs (limited) → Local DB (25 papers)
```

### Proposed (Working):
```
Frontend → Metadata DB (250M papers) → PDF Fetch API → Cache (10K papers)
                ↓
         Live APIs (arXiv, Semantic Scholar) for latest papers
```

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### PHASE 1: CLEANUP (30 minutes)

#### Step 1.1: Remove Broken Vector Database Code
```bash
# Delete backend folder
rm -rf backend/

# Delete vector DB service
rm src/services/api/vectordb.ts

# Delete setup scripts
rm setup_vectordb.bat setup_vectordb.sh

# Delete documentation
rm VECTOR_DB_SETUP.md HYBRID_SEARCH.md
```

#### Step 1.2: Update Aggregator
Remove vectorDB import and call from `src/services/api/aggregator.ts`:
```typescript
// REMOVE these lines:
import { searchVectorDB } from './vectordb';
const vectorDBPromise = searchVectorDB(...);
const [vectorDBResults, arxivResults, ...] = await Promise.allSettled([...]);
if (vectorDBResults.status === 'fulfilled') { ... }

// KEEP only:
const [arxivResults, semanticResults, crossrefResults] = await Promise.allSettled([
  searchArxiv({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) }),
  searchSemanticScholar({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) }),
  searchCrossRef({ query: processedQuery, maxResults: Math.ceil(maxResults / 3) })
]);
```

#### Step 1.3: Update Types
Remove 'vectordb' from source types in `src/services/api/types.ts`:
```typescript
source: 'arxiv' | 'semantic-scholar' | 'crossref' | 'core' | 'aggregated';
// Remove 'vectordb'
```

#### Step 1.4: Test Current System
```bash
npm run dev
# Search for "machine learning"
# Verify: Gets 10-15 papers with PDFs from APIs
```

---

### PHASE 2: DOWNLOAD METADATA (1 day)

#### Step 2.1: Download OpenAlex Snapshot

**Option A: AWS CLI (Fastest)**
```bash
# Install AWS CLI
pip install awscli

# Download works snapshot (~10 GB compressed)
aws s3 sync s3://openalex/data/works/ ./openalex_works/ --no-sign-request

# This downloads ~200 gzipped JSON files
# Each file contains ~100K papers
```

**Option B: Direct Download (Slower)**
```bash
# Download manifest
wget https://openalex.s3.amazonaws.com/data/works/manifest

# Download each file
while read url; do
  wget $url
done < manifest
```

**Expected Output:**
```
openalex_works/
├── updated_date=2024-01-01/
│   ├── part_000.gz
│   ├── part_001.gz
│   └── ... (200 files)
```

#### Step 2.2: Parse and Filter Papers

Create `scripts/parse_openalex.py`:
```python
import json
import gzip
import sqlite3
from pathlib import Path

# Create database
conn = sqlite3.connect('papers.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    year INTEGER,
    abstract TEXT,
    pdf_url TEXT,
    doi TEXT,
    citations INTEGER,
    venue TEXT,
    publisher TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute('CREATE INDEX IF NOT EXISTS idx_title ON papers(title)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_year ON papers(year)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_citations ON papers(citations)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_pdf ON papers(pdf_url)')

# Parse OpenAlex files
papers_with_pdfs = 0
total_papers = 0

for file_path in Path('openalex_works').rglob('*.gz'):
    print(f"Processing {file_path}...")
    
    with gzip.open(file_path, 'rt', encoding='utf-8') as f:
        for line in f:
            total_papers += 1
            
            try:
                paper = json.loads(line)
                
                # Filter: Only papers with open access PDFs
                if not paper.get('open_access', {}).get('is_oa'):
                    continue
                
                pdf_url = paper.get('open_access', {}).get('oa_url')
                if not pdf_url or not pdf_url.endswith('.pdf'):
                    continue
                
                # Extract data
                paper_id = paper['id'].split('/')[-1]
                title = paper.get('title', 'Untitled')
                year = paper.get('publication_year', 0)
                
                # Skip future papers
                if year > 2024:
                    continue
                
                authors = ', '.join([
                    a.get('author', {}).get('display_name', 'Unknown')
                    for a in paper.get('authorships', [])[:10]
                ])
                
                abstract = paper.get('abstract', '')
                if abstract and len(abstract) > 5000:
                    abstract = abstract[:5000] + '...'
                
                doi = paper.get('doi', '').replace('https://doi.org/', '')
                citations = paper.get('cited_by_count', 0)
                venue = paper.get('primary_location', {}).get('source', {}).get('display_name', '')
                publisher = paper.get('primary_location', {}).get('source', {}).get('publisher', '')
                
                # Insert into database
                cursor.execute('''
                    INSERT OR IGNORE INTO papers 
                    (id, title, authors, year, abstract, pdf_url, doi, citations, venue, publisher)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (paper_id, title, authors, year, abstract, pdf_url, doi, citations, venue, publisher))
                
                papers_with_pdfs += 1
                
                if papers_with_pdfs % 10000 == 0:
                    conn.commit()
                    print(f"  Processed {total_papers:,} papers, found {papers_with_pdfs:,} with PDFs")
                    
            except Exception as e:
                print(f"  Error parsing paper: {e}")
                continue
    
    conn.commit()

print(f"\nDONE!")
print(f"Total papers processed: {total_papers:,}")
print(f"Papers with free PDFs: {papers_with_pdfs:,}")

# Create full-text search index
cursor.execute('''
    CREATE VIRTUAL TABLE IF NOT EXISTS papers_fts USING fts5(
        title, abstract, authors, content=papers, content_rowid=rowid
    )
''')

cursor.execute('''
    INSERT INTO papers_fts(rowid, title, abstract, authors)
    SELECT rowid, title, abstract, authors FROM papers
''')

conn.commit()
conn.close()

print(f"Database created: papers.db")
print(f"Size: {Path('papers.db').stat().st_size / 1024 / 1024:.2f} MB")
```

**Run:**
```bash
python scripts/parse_openalex.py
```

**Expected Output:**
```
Processing openalex_works/part_000.gz...
  Processed 100,000 papers, found 15,234 with PDFs
Processing openalex_works/part_001.gz...
  Processed 200,000 papers, found 31,456 with PDFs
...
DONE!
Total papers processed: 250,000,000
Papers with free PDFs: 52,000,000
Database created: papers.db
Size: 8,500 MB
```

---

### PHASE 3: CREATE SEARCH API (2 hours)

#### Step 3.1: Create Backend API

Create `backend_simple/api.py`:
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).parent.parent / 'papers.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 20))
    offset = int(request.args.get('offset', 0))
    
    if not query:
        return jsonify({'papers': [], 'total': 0})
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Full-text search
    cursor.execute('''
        SELECT p.* FROM papers p
        JOIN papers_fts ON papers_fts.rowid = p.rowid
        WHERE papers_fts MATCH ?
        ORDER BY p.citations DESC
        LIMIT ? OFFSET ?
    ''', (query, limit, offset))
    
    papers = []
    for row in cursor.fetchall():
        papers.append({
            'id': row['id'],
            'title': row['title'],
            'authors': row['authors'].split(', ') if row['authors'] else [],
            'year': row['year'],
            'abstract': row['abstract'] or 'No abstract available',
            'pdfUrl': row['pdf_url'],
            'doi': row['doi'],
            'citations': row['citations'],
            'publication': row['venue'] or 'Unknown',
            'publisher': row['publisher'] or 'Unknown'
        })
    
    # Get total count
    cursor.execute('''
        SELECT COUNT(*) as total FROM papers p
        JOIN papers_fts ON papers_fts.rowid = p.rowid
        WHERE papers_fts MATCH ?
    ''', (query,))
    
    total = cursor.fetchone()['total']
    
    conn.close()
    
    return jsonify({
        'papers': papers,
        'total': total,
        'source': 'metadata-db'
    })

@app.route('/paper/<paper_id>', methods=['GET'])
def get_paper(paper_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM papers WHERE id = ?', (paper_id,))
    row = cursor.fetchone()
    
    if not row:
        return jsonify({'error': 'Paper not found'}), 404
    
    paper = {
        'id': row['id'],
        'title': row['title'],
        'authors': row['authors'].split(', ') if row['authors'] else [],
        'year': row['year'],
        'abstract': row['abstract'] or 'No abstract available',
        'pdfUrl': row['pdf_url'],
        'doi': row['doi'],
        'citations': row['citations'],
        'publication': row['venue'] or 'Unknown',
        'publisher': row['publisher'] or 'Unknown'
    }
    
    conn.close()
    return jsonify(paper)

@app.route('/stats', methods=['GET'])
def stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total FROM papers')
    total = cursor.fetchone()['total']
    
    cursor.execute('SELECT COUNT(*) as with_pdf FROM papers WHERE pdf_url IS NOT NULL')
    with_pdf = cursor.fetchone()['with_pdf']
    
    cursor.execute('SELECT MIN(year) as min_year, MAX(year) as max_year FROM papers')
    years = cursor.fetchone()
    
    conn.close()
    
    return jsonify({
        'total_papers': total,
        'papers_with_pdf': with_pdf,
        'year_range': [years['min_year'], years['max_year']],
        'database_size_mb': Path(DB_PATH).stat().st_size / 1024 / 1024
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'metadata-api'})

if __name__ == '__main__':
    print(f"Starting Metadata API on http://localhost:5000")
    print(f"Database: {DB_PATH}")
    print(f"Database size: {Path(DB_PATH).stat().st_size / 1024 / 1024:.2f} MB")
    app.run(host='0.0.0.0', port=5000, debug=True)
```

Create `backend_simple/requirements.txt`:
```
flask==3.0.0
flask-cors==4.0.0
```

**Install and Run:**
```bash
cd backend_simple
pip install -r requirements.txt
python api.py
```

**Test:**
```bash
curl "http://localhost:5000/search?q=machine+learning&limit=10"
curl "http://localhost:5000/stats"
```

---

### PHASE 4: INTEGRATE WITH FRONTEND (1 hour)

#### Step 4.1: Create Metadata DB Service

Create `src/services/api/metadatadb.ts`:
```typescript
import type { Paper } from '@/types';
import type { APIResponse, SearchOptions } from './types';

const METADATA_API = import.meta.env.VITE_METADATA_API || 'http://localhost:5000';

export async function searchMetadataDB(options: SearchOptions): Promise<APIResponse> {
  try {
    const { query, maxResults = 20, offset = 0 } = options;
    
    const params = new URLSearchParams({
      q: query,
      limit: maxResults.toString(),
      offset: offset.toString()
    });
    
    const response = await fetch(`${METADATA_API}/search?${params.toString()}`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) throw new Error('Metadata API failed');
    
    const data = await response.json();
    
    return {
      papers: data.papers,
      total: data.total,
      source: 'aggregated'
    };
  } catch (error) {
    console.error('Metadata DB search failed:', error);
    return { papers: [], total: 0, source: 'aggregated' };
  }
}
```

#### Step 4.2: Update Aggregator

Update `src/services/api/aggregator.ts`:
```typescript
import { searchMetadataDB } from './metadatadb';
import { searchArxiv } from './arxiv';
import { searchSemanticScholar } from './semanticScholar';

export const searchAllAPIs = async (options: SearchOptions): Promise<APIResponse> => {
  const { query, maxResults = 20 } = options;
  const processedQuery = processSearchQuery(query);
  
  // Try metadata DB first (50M+ papers)
  const metadataResults = await searchMetadataDB({ 
    query: processedQuery, 
    maxResults 
  });
  
  // If we got good results from metadata DB, return them
  if (metadataResults.papers.length >= maxResults * 0.5) {
    return metadataResults;
  }
  
  // Otherwise, supplement with live APIs
  const [arxivResults, semanticResults] = await Promise.allSettled([
    searchArxiv({ query: processedQuery, maxResults: 10 }),
    searchSemanticScholar({ query: processedQuery, maxResults: 10 })
  ]);
  
  const allPapers = [...metadataResults.papers];
  
  if (arxivResults.status === 'fulfilled') {
    allPapers.push(...arxivResults.value.papers);
  }
  
  if (semanticResults.status === 'fulfilled') {
    allPapers.push(...semanticResults.value.papers);
  }
  
  // Deduplicate and sort
  const uniquePapers = deduplicatePapers(allPapers);
  const papersWithPdf = uniquePapers.filter(p => p.pdfUrl);
  papersWithPdf.sort((a, b) => b.citations - a.citations);
  
  return {
    papers: papersWithPdf.slice(0, maxResults),
    total: papersWithPdf.length,
    source: 'aggregated'
  };
};
```

#### Step 4.3: Update Environment

Add to `.env`:
```
VITE_METADATA_API=http://localhost:5000
```

---

### PHASE 5: ADD PDF CACHING (Optional, 1 day)

#### Step 5.1: Download Top 10K Papers

Create `scripts/download_popular_pdfs.py`:
```python
import sqlite3
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import time

DB_PATH = 'papers.db'
PDF_DIR = Path('pdf_cache')
PDF_DIR.mkdir(exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Get top 10K most cited papers
cursor.execute('''
    SELECT id, title, pdf_url, citations 
    FROM papers 
    WHERE pdf_url IS NOT NULL 
    ORDER BY citations DESC 
    LIMIT 10000
''')

papers = cursor.fetchall()
conn.close()

def download_pdf(paper):
    paper_id, title, pdf_url, citations = paper
    pdf_path = PDF_DIR / f"{paper_id}.pdf"
    
    if pdf_path.exists():
        return f"✓ Cached: {title[:50]}"
    
    try:
        response = requests.get(pdf_url, timeout=30)
        if response.status_code == 200:
            pdf_path.write_bytes(response.content)
            return f"✓ Downloaded: {title[:50]}"
        else:
            return f"✗ Failed ({response.status_code}): {title[:50]}"
    except Exception as e:
        return f"✗ Error: {title[:50]} - {e}"

print("Downloading top 10,000 papers...")
with ThreadPoolExecutor(max_workers=10) as executor:
    for i, result in enumerate(executor.map(download_pdf, papers), 1):
        print(f"[{i}/10000] {result}")
        if i % 100 == 0:
            time.sleep(5)  # Rate limiting

print("Done!")
```

#### Step 5.2: Serve Cached PDFs

Update `backend_simple/api.py`:
```python
from flask import send_file

PDF_CACHE_DIR = Path(__file__).parent.parent / 'pdf_cache'

@app.route('/pdf/<paper_id>', methods=['GET'])
def get_pdf(paper_id):
    pdf_path = PDF_CACHE_DIR / f"{paper_id}.pdf"
    
    if pdf_path.exists():
        return send_file(pdf_path, mimetype='application/pdf')
    
    # If not cached, redirect to original URL
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT pdf_url FROM papers WHERE id = ?', (paper_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row and row['pdf_url']:
        return redirect(row['pdf_url'])
    
    return jsonify({'error': 'PDF not found'}), 404
```

---

## 📊 FINAL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  - Search interface                                          │
│  - Paper display with PDF viewer                            │
│  - Filters (year, citations, open access)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   AGGREGATOR SERVICE                         │
│  1. Query Metadata DB (50M papers) → 80% of results         │
│  2. Query Live APIs (arXiv, Semantic Scholar) → 20%         │
│  3. Deduplicate & sort by citations                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  METADATA DB     │    │   LIVE APIs      │
│  (SQLite)        │    │  - arXiv         │
│  - 50M papers    │    │  - Semantic      │
│  - 8GB database  │    │    Scholar       │
│  - FTS index     │    │  - CrossRef      │
│  - Instant       │    │  - Latest papers │
│    search        │    │                  │
└────────┬─────────┘    └──────────────────┘
         │
         ▼
┌──────────────────┐
│  PDF CACHE       │
│  (Optional)      │
│  - 10K papers    │
│  - 1TB storage   │
│  - Popular only  │
└──────────────────┘
```

---

## 💰 COST BREAKDOWN

### Option 1: Metadata Only (RECOMMENDED)
- **Storage:** 10 GB (metadata database)
- **Hardware:** Any laptop/PC
- **Cost:** $0
- **Papers:** 50M+ with free PDFs
- **Search Speed:** <100ms
- **PDF Access:** On-demand from source

### Option 2: Metadata + Top 10K PDFs
- **Storage:** 1 TB (10GB metadata + 1TB PDFs)
- **Hardware:** $50 external HDD
- **Cost:** $50
- **Papers:** 50M+ searchable, 10K cached
- **Search Speed:** <100ms
- **PDF Access:** Instant for top 10K, on-demand for others

### Option 3: Full arXiv Download
- **Storage:** 5 TB (arXiv bulk data)
- **Hardware:** $100 external HDD
- **Cost:** $100 + $50 AWS transfer
- **Papers:** 2.4M fully local
- **Search Speed:** <100ms
- **PDF Access:** Instant for all

---

## ⏱️ TIME ESTIMATE

| Phase | Task | Time |
|-------|------|------|
| 1 | Cleanup broken code | 30 min |
| 2 | Download OpenAlex metadata | 4 hours |
| 3 | Parse and create database | 8 hours |
| 4 | Create search API | 2 hours |
| 5 | Integrate with frontend | 1 hour |
| **TOTAL** | **~16 hours (2 days)** | |

---

## 🎯 SUCCESS METRICS

After implementation, you will have:
- ✅ **50+ million** searchable papers
- ✅ **100% free** PDF access
- ✅ **<100ms** search speed
- ✅ **$0-$100** total cost
- ✅ **No API rate limits** (local database)
- ✅ **Offline capable** (metadata cached)
- ✅ **Scalable** (can add more sources)

---

## 🚀 NEXT STEPS

1. **Read PROJECT_ANALYSIS.md** - Understand current issues
2. **Execute Phase 1** - Remove broken vector DB code
3. **Execute Phase 2** - Download OpenAlex metadata
4. **Execute Phase 3** - Create search API
5. **Execute Phase 4** - Integrate with frontend
6. **Test** - Search for papers, verify PDFs work
7. **(Optional) Execute Phase 5** - Add PDF caching

**Questions to answer before starting:**
1. Do you have 10GB free disk space? (for metadata)
2. Do you have Python 3.8+ installed?
3. Do you have stable internet? (for 10GB download)
4. Do you want PDF caching? (requires 1TB storage)

Let me know when you're ready to start, and I'll guide you through each step!
