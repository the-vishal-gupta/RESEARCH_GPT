import chromadb
from chromadb.config import Settings
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
CHROMA_DB_PATH = "./chroma_storage"
MAX_STORAGE_GB = 10
COLLECTION_NAME = "research_papers"

# Initialize ChromaDB with persistent storage
chroma_client = chromadb.PersistentClient(
    path=CHROMA_DB_PATH,
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=True
    )
)

# Initialize embedding model (384-dimensional embeddings)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Get or create collection
try:
    collection = chroma_client.get_collection(name=COLLECTION_NAME)
    print(f"✅ Loaded existing collection: {COLLECTION_NAME}")
except:
    collection = chroma_client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "Research papers vector database"}
    )
    print(f"✅ Created new collection: {COLLECTION_NAME}")

def get_storage_size():
    """Calculate current storage size in GB"""
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(CHROMA_DB_PATH):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            total_size += os.path.getsize(filepath)
    return total_size / (1024 ** 3)  # Convert to GB

def create_embedding(text):
    """Generate embedding for text"""
    return embedding_model.encode(text).tolist()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    storage_gb = get_storage_size()
    count = collection.count()
    
    return jsonify({
        'status': 'ok',
        'service': 'ChromaDB Vector Database',
        'collection': COLLECTION_NAME,
        'documents': count,
        'storage_used_gb': round(storage_gb, 2),
        'storage_limit_gb': MAX_STORAGE_GB,
        'storage_available_gb': round(MAX_STORAGE_GB - storage_gb, 2)
    })

@app.route('/add', methods=['POST'])
def add_document():
    """Add a single document to ChromaDB"""
    try:
        data = request.json
        
        # Required fields
        doc_id = data.get('id')
        text = data.get('text')
        metadata = data.get('metadata', {})
        
        if not doc_id or not text:
            return jsonify({'error': 'id and text are required'}), 400
        
        # Check storage limit
        storage_gb = get_storage_size()
        if storage_gb >= MAX_STORAGE_GB:
            return jsonify({'error': f'Storage limit reached ({MAX_STORAGE_GB}GB)'}), 507
        
        # Generate embedding
        embedding = create_embedding(text)
        
        # Add to collection
        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text],
            metadatas=[metadata]
        )
        
        return jsonify({
            'success': True,
            'id': doc_id,
            'message': 'Document added successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_batch', methods=['POST'])
def add_batch():
    """Add multiple documents to ChromaDB"""
    try:
        data = request.json
        documents = data.get('documents', [])
        
        if not documents:
            return jsonify({'error': 'documents array is required'}), 400
        
        # Check storage limit
        storage_gb = get_storage_size()
        if storage_gb >= MAX_STORAGE_GB:
            return jsonify({'error': f'Storage limit reached ({MAX_STORAGE_GB}GB)'}), 507
        
        ids = []
        texts = []
        metadatas = []
        embeddings = []
        
        for doc in documents:
            doc_id = doc.get('id')
            text = doc.get('text')
            metadata = doc.get('metadata', {})
            
            if not doc_id or not text:
                continue
            
            ids.append(doc_id)
            texts.append(text)
            metadatas.append(metadata)
            embeddings.append(create_embedding(text))
        
        if not ids:
            return jsonify({'error': 'No valid documents to add'}), 400
        
        # Add batch to collection
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        
        return jsonify({
            'success': True,
            'count': len(ids),
            'message': f'{len(ids)} documents added successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    """Search for similar documents"""
    try:
        data = request.json
        query = data.get('query')
        n_results = data.get('n_results', 10)
        
        if not query:
            return jsonify({'error': 'query is required'}), 400
        
        # Generate query embedding
        query_embedding = create_embedding(query)
        
        # Search collection
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        if results['ids'] and len(results['ids']) > 0:
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    'id': results['ids'][0][i],
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i]
                })
        
        return jsonify({
            'success': True,
            'query': query,
            'results': formatted_results,
            'count': len(formatted_results)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get', methods=['GET'])
def get_document():
    """Get document by ID"""
    try:
        doc_id = request.args.get('id')
        
        if not doc_id:
            return jsonify({'error': 'id parameter is required'}), 400
        
        result = collection.get(ids=[doc_id])
        
        if not result['ids']:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({
            'success': True,
            'id': result['ids'][0],
            'text': result['documents'][0],
            'metadata': result['metadatas'][0]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete', methods=['DELETE'])
def delete_document():
    """Delete document by ID"""
    try:
        doc_id = request.args.get('id')
        
        if not doc_id:
            return jsonify({'error': 'id parameter is required'}), 400
        
        collection.delete(ids=[doc_id])
        
        return jsonify({
            'success': True,
            'message': f'Document {doc_id} deleted'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/count', methods=['GET'])
def count_documents():
    """Get total document count"""
    try:
        count = collection.count()
        storage_gb = get_storage_size()
        
        return jsonify({
            'success': True,
            'count': count,
            'storage_used_gb': round(storage_gb, 2),
            'storage_limit_gb': MAX_STORAGE_GB
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clear', methods=['POST'])
def clear_collection():
    """Clear all documents from collection"""
    try:
        # Delete and recreate collection
        chroma_client.delete_collection(name=COLLECTION_NAME)
        global collection
        collection = chroma_client.create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Research papers vector database"}
        )
        
        return jsonify({
            'success': True,
            'message': 'Collection cleared successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get database statistics"""
    try:
        count = collection.count()
        storage_gb = get_storage_size()
        
        return jsonify({
            'success': True,
            'collection_name': COLLECTION_NAME,
            'total_documents': count,
            'storage_used_gb': round(storage_gb, 2),
            'storage_limit_gb': MAX_STORAGE_GB,
            'storage_available_gb': round(MAX_STORAGE_GB - storage_gb, 2),
            'storage_used_percent': round((storage_gb / MAX_STORAGE_GB) * 100, 2),
            'embedding_model': 'all-MiniLM-L6-v2',
            'embedding_dimensions': 384
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🗄️  ChromaDB Vector Database Server")
    print("=" * 60)
    print(f"📁 Storage Path: {CHROMA_DB_PATH}")
    print(f"💾 Storage Limit: {MAX_STORAGE_GB} GB")
    print(f"📊 Collection: {COLLECTION_NAME}")
    print(f"🔢 Current Documents: {collection.count()}")
    print(f"📦 Storage Used: {round(get_storage_size(), 2)} GB")
    print("=" * 60)
    print("📡 Server running on http://localhost:8000")
    print("🔍 Endpoints:")
    print("   - GET  /health          - Health check")
    print("   - POST /add             - Add single document")
    print("   - POST /add_batch       - Add multiple documents")
    print("   - POST /search          - Search similar documents")
    print("   - GET  /get?id=xxx      - Get document by ID")
    print("   - DELETE /delete?id=xxx - Delete document")
    print("   - GET  /count           - Get document count")
    print("   - GET  /stats           - Get database stats")
    print("   - POST /clear           - Clear all documents")
    print("=" * 60)
    app.run(host='0.0.0.0', port=8000, debug=True)
