# ChromaDB Quick Reference Card

## 🚀 Setup (One-Time)
```bash
cd chromadb
pip install -r requirements.txt
```

## ▶️ Start Server
```bash
python chroma_server.py
```
Server runs on: http://localhost:8000

## 🧪 Run Tests
```bash
python test_chroma.py
```

## 📡 API Quick Reference

### Health Check
```bash
curl http://localhost:8000/health
```

### Add Document
```bash
curl -X POST http://localhost:8000/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": "paper_001",
    "text": "Your paper text here...",
    "metadata": {"title": "Paper Title", "year": 2023}
  }'
```

### Search
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "neural networks",
    "n_results": 5
  }'
```

### Get Stats
```bash
curl http://localhost:8000/stats
```

### Count Documents
```bash
curl http://localhost:8000/count
```

### Get Document
```bash
curl http://localhost:8000/get?id=paper_001
```

### Delete Document
```bash
curl -X DELETE http://localhost:8000/delete?id=paper_001
```

### Clear All
```bash
curl -X POST http://localhost:8000/clear
```

## 🐍 Python Examples

### Add Document
```python
import requests

requests.post('http://localhost:8000/add', json={
    'id': 'paper_001',
    'text': 'Deep learning paper text...',
    'metadata': {'title': 'DL Paper', 'year': 2023}
})
```

### Search
```python
response = requests.post('http://localhost:8000/search', json={
    'query': 'How do neural networks work?',
    'n_results': 5
})

results = response.json()['results']
for doc in results:
    print(f"{doc['id']}: {doc['distance']}")
```

### Batch Add
```python
requests.post('http://localhost:8000/add_batch', json={
    'documents': [
        {'id': 'p1', 'text': 'Text 1', 'metadata': {}},
        {'id': 'p2', 'text': 'Text 2', 'metadata': {}}
    ]
})
```

## 📊 Key Specs

| Item | Value |
|------|-------|
| Storage | 10GB |
| Capacity | ~10M docs |
| Dimensions | 384 |
| Model | all-MiniLM-L6-v2 |
| Port | 8000 |
| Search Speed | 10-100ms |

## 🎯 Common Tasks

### Check if Running
```bash
curl http://localhost:8000/health
```

### See Storage Usage
```bash
curl http://localhost:8000/stats
```

### Test Search
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "n_results": 3}'
```

## 🐛 Troubleshooting

### Server won't start
```bash
pip install -r requirements.txt
```

### Port in use
Change port in `chroma_server.py` line 234

### Out of storage
Increase `MAX_STORAGE_GB` in `chroma_server.py`

### Slow search
Reduce `n_results` or add more RAM

## 📚 Files

- `chroma_server.py` - Main server
- `test_chroma.py` - Test suite
- `requirements.txt` - Dependencies
- `README.md` - Quick start
- `CHROMADB_GUIDE.md` - Full guide
- `PRESENTATION_GUIDE.md` - For professors

## 💡 Tips

1. Lower distance = more similar (0 = identical)
2. Batch add is faster than individual adds
3. Search is fast even with millions of docs
4. Metadata is searchable and filterable
5. IDs must be unique

## 🔗 Integration Points

When integrating with ResearchGPT:
1. Add papers when saved
2. Search before chatbot response
3. Recommend similar papers
4. Detect duplicates

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Server starts successfully
- [ ] Tests pass
- [ ] Can add documents
- [ ] Can search documents
- [ ] Stats show correct info

---

**Server**: http://localhost:8000  
**Docs**: CHROMADB_GUIDE.md  
**Status**: ✅ Ready
