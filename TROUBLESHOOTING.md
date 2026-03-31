# 🆘 ResearchGPT Troubleshooting Guide

Quick solutions for common issues.

## ❌ Problem: "No results found"

### Solution 1: Check Server is Running
```bash
# You should see TWO servers running:
# 1. Vite dev server on http://localhost:5173
# 2. Express backend on http://localhost:3001

# Test backend:
curl http://localhost:3001/health
# Should respond: {"status":"OK","timestamp":"..."}
```

### Solution 2: Use Simpler Search Terms
❌ **Bad Search Terms**:
- "machine learning applications in healthcare"
- "deep learning architectures for NLP"
- "recent papers on computer vision with transformers"

✅ **Good Search Terms**:
- "machine learning"
- "deep learning"
- "neural networks"
- "transformers"
- "computer vision"

**Why**: Shorter queries work better due to API matching

### Solution 3: Check Browser Console
1. Open DevTools: **F12**
2. Go to **Console** tab
3. Look for red error messages
4. Check **Network** tab for failed /api/* requests

### Solution 4: Verify APIs are Responding
Check backend logs in your terminal - should show:
```
✅ arXiv: X papers
✅ Semantic Scholar: X papers
✅ CORE: X papers
```

If all show 0, the APIs might be down (rare).

---

## ❌ Problem: Papers Don't Have PDFs

### Solution 1: Check PDF URLs
In browser console (F12), search results should show:
```json
{
  "title": "...",
  "pdfUrl": "https://arxiv.org/pdf/...",  // ✅ Should have this
  ...
}
```

### Solution 2: This Is Expected for Some Papers
- arXiv papers: 100% have PDFs
- Semantic Scholar: 40-60% have PDFs
- CORE papers: 90%+ have PDFs

If search returns mostly Semantic Scholar papers (few PDFs), try different search terms to get more arXiv results.

---

## ❌ Problem: Searches Take 5+ Seconds

### Solution: This Shouldn't Happen Anymore
With the fixes, searches should be <1 second.

**If still slow**:
1. Check backend server is running
2. Check browser Network tab for slow requests
3. Restart with `npm run dev`

---

## ❌ Problem: CORS Error in Browser Console

### Example Error:
```
Access to XMLHttpRequest at 'https://export.arxiv.org/api/query'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Solution: This Is Fixed
- Make sure you're using `npm run dev` (not `npm run vite`)
- This starts both backend AND frontend
- Backend proxy handles CORS

Verify both are running:
```bash
# Terminal should show:
# Server running on http://localhost:3001
# VITE v... ready in X ms
```

---

## ❌ Problem: npm run dev Fails

### Error: "not found: run-p"
```bash
npm install npm-run-all
npm run dev
```

### Error: "Port 3001 already in use"
```bash
# Kill the process using port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3001
kill -9 <PID>
```

### Error: "Cannot find module 'express'"
```bash
npm install
npm run dev
```

---

## ❌ Problem: CORE API Not Working

### This Is Optional - App Works Without It

If you added CORE API key and it still doesn't work:

### Check 1: Is API Key Valid?
1. Go to https://core.ac.uk/api
2. Verify your API key
3. Update `.env`:
   ```env
   VITE_CORE_API_KEY=your_valid_key_here
   ```

### Check 2: API Rate Limit
- Free tier: 200 requests/hour
- If exceeded, wait an hour
- In browser console, look for 429 errors

### Check 3: It's Optional
- Remove or leave empty in `.env`
- arXiv + Semantic Scholar still return 15-20+ papers

---

## ❌ Problem: "Invalid CORE API Key" Error

### Solution 1: Get New Key
1. Visit https://core.ac.uk/api
2. Click "Get API Key"
3. Sign up with email
4. Verify email
5. Copy new key to `.env`

### Solution 2: Just Skip CORE
Leave `VITE_CORE_API_KEY` empty in `.env` - full functionality without it.

---

## ✅ Everything Working?

### Test Checklist:
- [ ] `npm run dev` runs both server and frontend
- [ ] Can open http://localhost:5173
- [ ] Search returns papers in <2 seconds
- [ ] See 15-20+ papers in results
- [ ] Console shows debug logs (F12)
- [ ] PDFs open when you click "Download PDF"

If all pass - you're good! 🎉

---

## 🔧 Advanced: Enable Debug Mode

To see detailed logs:
1. Edit `.env`
2. Add: `VITE_DEBUG=true`
3. Restart with `npm run dev`
4. Browser console will show:
   - Query processing steps
   - Each API call results
   - Citation enrichment progress
   - Final paper list

---

## 📞 Still Having Issues?

### Check These Files:
1. **Terminal/Console Logs**: Watch what server prints
2. **Browser Console**: F12 → Console tab
3. **Browser Network**: F12 → Network tab
   - Look for /api/* requests
   - Check response status (should be 200)
4. **Backend Errors**: Terminal output when running `npm run dev`

### Common Patterns to Look For:
```
❌ "Cannot GET /api/arxiv" → Backend not running
❌ "CORE API key not configured" → Optional CORE, not required
❌ "Network timeout" → API is slow, try again
✅ "15 papers found" → Everything working!
```

---

## 🚀 Quick Restart

If something goes wrong:
```bash
# Kill any running servers (Ctrl+C)

# Clear caches
rm -rf node_modules
npm install

# Start fresh
npm run dev
```

---

## 📚 Need Help With Paper Searching?

Try these example searches:
- "machine learning" - General ML papers
- "deep learning" - Deep learning papers
- "neural networks" - All neural network papers
- "nlp" - Natural Language Processing
- "computer vision" - Vision papers
- "reinforcement learning" - RL papers
- "transformers" - Transformer architecture papers
- "attention" - Attention mechanism papers
- "bert" - BERT and variants
- "generative models" - GANs, VAEs, diffusion

All should return 15-20+ papers within seconds!

---

## ✨ Summary

**Most issues are solved by**:
1. Running `npm run dev` (not just `npm run vite`)
2. Using simpler search terms
3. Checking backend is on port 3001
4. Looking at browser console for specific errors

Good luck! 📚🚀
