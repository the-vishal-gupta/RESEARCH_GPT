from flask import Flask, request, jsonify
from flask_cors import CORS
from scholarly import scholarly
import time
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/scholar/search', methods=['GET'])
def search_scholar():
    try:
        query = request.args.get('query', '')
        max_results = int(request.args.get('maxResults', 10))
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        logger.info(f"Searching Google Scholar for: {query}")
        
        # Search Google Scholar
        search_query = scholarly.search_pubs(query)
        
        papers = []
        for i, result in enumerate(search_query):
            if i >= max_results:
                break
            
            try:
                # Add delay to avoid rate limiting (2-3 seconds between requests)
                if i > 0:
                    time.sleep(2.5)
                
                bib = result.get('bib', {})
                
                # Extract authors
                authors = []
                if 'author' in bib:
                    if isinstance(bib['author'], list):
                        authors = bib['author']
                    else:
                        authors = [bib['author']]
                
                # Extract year
                year = 2024
                if 'pub_year' in bib:
                    try:
                        year = int(bib['pub_year'])
                    except:
                        year = 2024
                
                # Extract PDF URL
                pdf_url = result.get('eprint_url', None)
                
                paper = {
                    'id': f"scholar-{i}",
                    'title': bib.get('title', 'Untitled'),
                    'authors': authors if authors else ['Unknown Author'],
                    'year': year,
                    'abstract': bib.get('abstract', 'No abstract available'),
                    'citations': result.get('num_citations', 0),
                    'publication': bib.get('venue', 'Unknown'),
                    'pdfUrl': pdf_url,
                    'doi': None,
                    'publisher': 'Google Scholar'
                }
                
                papers.append(paper)
                logger.info(f"Found paper {i+1}/{max_results}: {paper['title'][:50]}...")
                
            except Exception as e:
                logger.error(f"Error processing result {i}: {str(e)}")
                continue
        
        logger.info(f"Successfully retrieved {len(papers)} papers")
        return jsonify({'papers': papers, 'total': len(papers)})
    
    except Exception as e:
        logger.error(f"Error in search_scholar: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scholar/author', methods=['GET'])
def search_author():
    try:
        author_name = request.args.get('name', '')
        max_results = int(request.args.get('maxResults', 10))
        
        if not author_name:
            return jsonify({'error': 'Author name is required'}), 400
        
        logger.info(f"Searching for author: {author_name}")
        
        # Search for author
        search_query = scholarly.search_author(author_name)
        
        try:
            # Get first author match
            author = next(search_query)
            
            # Fill author details
            author = scholarly.fill(author)
            
            # Get author's publications
            papers = []
            publications = author.get('publications', [])
            
            for i, pub in enumerate(publications):
                if i >= max_results:
                    break
                
                try:
                    # Add delay
                    if i > 0:
                        time.sleep(2.5)
                    
                    # Fill publication details
                    pub_filled = scholarly.fill(pub)
                    bib = pub_filled.get('bib', {})
                    
                    # Extract authors
                    authors = []
                    if 'author' in bib:
                        if isinstance(bib['author'], list):
                            authors = bib['author']
                        else:
                            authors = [bib['author']]
                    
                    # Extract year
                    year = 2024
                    if 'pub_year' in bib:
                        try:
                            year = int(bib['pub_year'])
                        except:
                            year = 2024
                    
                    paper = {
                        'id': f"scholar-author-{i}",
                        'title': bib.get('title', 'Untitled'),
                        'authors': authors if authors else [author_name],
                        'year': year,
                        'abstract': bib.get('abstract', 'No abstract available'),
                        'citations': pub_filled.get('num_citations', 0),
                        'publication': bib.get('venue', 'Unknown'),
                        'pdfUrl': pub_filled.get('eprint_url', None),
                        'doi': None,
                        'publisher': 'Google Scholar'
                    }
                    
                    papers.append(paper)
                    logger.info(f"Found paper {i+1}/{max_results}: {paper['title'][:50]}...")
                    
                except Exception as e:
                    logger.error(f"Error processing publication {i}: {str(e)}")
                    continue
            
            logger.info(f"Successfully retrieved {len(papers)} papers for author {author_name}")
            return jsonify({
                'papers': papers,
                'total': len(papers),
                'author': {
                    'name': author.get('name', author_name),
                    'affiliation': author.get('affiliation', 'Unknown'),
                    'citations': author.get('citedby', 0),
                    'hindex': author.get('hindex', 0)
                }
            })
            
        except StopIteration:
            logger.warning(f"No author found with name: {author_name}")
            return jsonify({'error': 'Author not found', 'papers': [], 'total': 0}), 404
    
    except Exception as e:
        logger.error(f"Error in search_author: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Google Scholar API'})

if __name__ == '__main__':
    print("=" * 60)
    print("🎓 Google Scholar API Server")
    print("=" * 60)
    print("⚠️  WARNING: This uses web scraping and may violate Google's ToS")
    print("⚠️  Use only for local development/testing")
    print("⚠️  Your IP may get temporarily blocked by Google")
    print("=" * 60)
    print("📡 Server running on http://localhost:5001")
    print("🔍 Endpoints:")
    print("   - GET /api/scholar/search?query=machine+learning&maxResults=10")
    print("   - GET /api/scholar/author?name=Sachin+More&maxResults=10")
    print("   - GET /health")
    print("=" * 60)
    app.run(port=5001, debug=True)
