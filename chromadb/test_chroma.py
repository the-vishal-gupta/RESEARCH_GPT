import requests
import json

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def test_health():
    print_section("1. Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(json.dumps(response.json(), indent=2))

def test_add_single():
    print_section("2. Add Single Document")
    data = {
        "id": "paper_001",
        "text": "Deep learning is a subset of machine learning that uses neural networks with multiple layers. It has revolutionized computer vision, natural language processing, and speech recognition.",
        "metadata": {
            "title": "Introduction to Deep Learning",
            "author": "John Doe",
            "year": 2023,
            "category": "AI"
        }
    }
    response = requests.post(f"{BASE_URL}/add", json=data)
    print(json.dumps(response.json(), indent=2))

def test_add_batch():
    print_section("3. Add Batch Documents")
    data = {
        "documents": [
            {
                "id": "paper_002",
                "text": "Natural language processing enables computers to understand, interpret, and generate human language. Modern NLP uses transformer architectures like BERT and GPT.",
                "metadata": {
                    "title": "NLP with Transformers",
                    "author": "Jane Smith",
                    "year": 2023,
                    "category": "NLP"
                }
            },
            {
                "id": "paper_003",
                "text": "Computer vision allows machines to interpret and understand visual information from the world. Convolutional neural networks are the foundation of modern computer vision.",
                "metadata": {
                    "title": "Computer Vision Fundamentals",
                    "author": "Bob Johnson",
                    "year": 2022,
                    "category": "CV"
                }
            },
            {
                "id": "paper_004",
                "text": "Reinforcement learning is a type of machine learning where agents learn to make decisions by interacting with an environment. It has applications in robotics and game playing.",
                "metadata": {
                    "title": "Reinforcement Learning Basics",
                    "author": "Alice Brown",
                    "year": 2023,
                    "category": "RL"
                }
            }
        ]
    }
    response = requests.post(f"{BASE_URL}/add_batch", json=data)
    print(json.dumps(response.json(), indent=2))

def test_search():
    print_section("4. Search Similar Documents")
    data = {
        "query": "How do neural networks work?",
        "n_results": 3
    }
    response = requests.post(f"{BASE_URL}/search", json=data)
    result = response.json()
    
    print(f"Query: {data['query']}")
    print(f"Found {result['count']} results:\n")
    
    for i, doc in enumerate(result['results'], 1):
        print(f"Result {i}:")
        print(f"  ID: {doc['id']}")
        print(f"  Title: {doc['metadata'].get('title', 'N/A')}")
        print(f"  Distance: {doc['distance']:.4f}")
        print(f"  Text: {doc['text'][:100]}...")
        print()

def test_get():
    print_section("5. Get Document by ID")
    response = requests.get(f"{BASE_URL}/get?id=paper_001")
    print(json.dumps(response.json(), indent=2))

def test_count():
    print_section("6. Count Documents")
    response = requests.get(f"{BASE_URL}/count")
    print(json.dumps(response.json(), indent=2))

def test_stats():
    print_section("7. Database Statistics")
    response = requests.get(f"{BASE_URL}/stats")
    print(json.dumps(response.json(), indent=2))

def test_delete():
    print_section("8. Delete Document")
    response = requests.delete(f"{BASE_URL}/delete?id=paper_004")
    print(json.dumps(response.json(), indent=2))
    
    # Check count after delete
    response = requests.get(f"{BASE_URL}/count")
    print("\nAfter deletion:")
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    print("\n" + "🧪 ChromaDB Test Suite" + "\n")
    
    try:
        test_health()
        test_add_single()
        test_add_batch()
        test_search()
        test_get()
        test_count()
        test_stats()
        test_delete()
        
        print("\n" + "=" * 60)
        print("✅ All tests completed successfully!")
        print("=" * 60 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to ChromaDB server")
        print("Make sure the server is running: python chroma_server.py\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")
