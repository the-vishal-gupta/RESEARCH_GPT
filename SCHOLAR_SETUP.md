# Google Scholar Setup (Optional)

## ⚠️ Important Warnings

- **Against ToS**: Google Scholar has no official API. This uses web scraping which violates Google's Terms of Service
- **IP Blocking**: Your IP may get temporarily blocked (24-48 hours)
- **Local Only**: For local development/testing only. DO NOT use in production
- **Slow**: 2-3 seconds per paper (vs 0.1 seconds for other APIs)

## Quick Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `flask` - Web server
- `flask-cors` - CORS support
- `scholarly` - Google Scholar scraper

### 2. Start Scholar Server

**Option A: Using npm script**
```bash
npm run scholar
```

**Option B: Direct Python**
```bash
python scholar_server.py
```

You should see:
```
🎓 Google Scholar API Server
📡 Server running on http://localhost:5001
```

### 3. Start React App

In a **separate terminal**:
```bash
npm run dev
```

### 4. Use Normally

Search for papers in ResearchGPT. Google Scholar results will be automatically included!

## How It Works

```
React App (Port 5173)
    ↓
Google Scholar API (Port 5001) - Python Flask
    ↓
Scholarly Library - Web Scraper
    ↓
Google Scholar Website
```

The app automatically detects if the Scholar server is running. If not, it uses the other 6 APIs.

## API Endpoints

**Search Papers:**
```
GET http://localhost:5001/api/scholar/search?query=machine+learning&maxResults=10
```

**Search by Author:**
```
GET http://localhost:5001/api/scholar/author?name=Sachin+More&maxResults=10
```

**Health Check:**
```
GET http://localhost:5001/health
```

## Performance

- **First paper**: ~3 seconds
- **Each additional**: ~2.5 seconds
- **10 papers**: ~25-30 seconds total

Why so slow? Google detects rapid requests. We add delays to avoid IP blocking.

## Troubleshooting

### "Connection refused"
**Problem**: Scholar server not running  
**Solution**: Run `python scholar_server.py`

### "Module not found: scholarly"
**Problem**: Dependencies not installed  
**Solution**: Run `pip install -r requirements.txt`

### "Rate limit exceeded"
**Problem**: Too many requests, IP blocked  
**Solution**: Wait 30-60 minutes, reduce maxResults

### No results for author
**Problem**: Author not on Google Scholar  
**Solution**: Try OpenAlex API (has excellent author search)

## Configuration

### Change Port

**scholar_server.py:**
```python
app.run(port=5001, debug=True)  # Change to 5002, etc.
```

**src/services/api/googleScholar.ts:**
```typescript
const SCHOLAR_API_URL = 'http://localhost:5001/api/scholar';
```

### Adjust Rate Limiting

**scholar_server.py:**
```python
time.sleep(2.5)  # Increase to 3-4 for safer rate limiting
```

## When to Use

### ✅ Use Google Scholar when:
- Searching for specific authors not in other APIs
- Need the most comprehensive coverage
- Testing locally only
- Willing to wait 2-3 seconds per paper

### ❌ Don't use when:
- In production
- Need fast results
- Concerned about IP blocking
- Can find papers in other APIs (which is 99% of the time)

## Comparison

| Feature | Google Scholar | Other 6 APIs |
|---------|---------------|--------------|
| Coverage | Highest | 300M+ papers |
| Speed | Very Slow (25s) | Fast (2-3s) |
| Legal | ❌ No | ✅ Yes |
| Blocking Risk | ⚠️ Yes | ✅ No |
| Production | ❌ No | ✅ Yes |

## Recommendation

**Use the 6 free APIs for 99% of use cases.**

Only start the Scholar server when you need to find a specific author not in other databases.

The app works perfectly fine without Google Scholar!

## Testing

Test if Scholar is working:

```bash
# Check health
curl http://localhost:5001/health

# Search papers
curl "http://localhost:5001/api/scholar/search?query=machine+learning&maxResults=3"

# Search author
curl "http://localhost:5001/api/scholar/author?name=Sachin+More&maxResults=5"
```

## Summary

- **Optional**: App works fine without it
- **Slow**: 10x slower than other APIs
- **Risky**: Against ToS, IP blocking risk
- **Local Only**: Never use in production
- **Best for**: Finding specific authors not in other databases

---

For most users, the 6 free APIs (arXiv, Semantic Scholar, CORE, OpenAlex, DBLP, Europe PMC) are more than enough!
