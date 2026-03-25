import type { Paper, LabsResult, SavedPaper } from '@/types';

export const mockPapers: Paper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    publication: 'Advances in Neural Information Processing Systems',
    year: 2017,
    pages: '5998-6008',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    citations: 154320,
    publisher: 'NeurIPS',
    doi: '10.48550/arXiv.1706.03762',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf'
  },
  {
    id: '2',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    publication: 'IEEE Conference on Computer Vision and Pattern Recognition',
    year: 2016,
    pages: '770-778',
    abstract: 'We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously.',
    citations: 198543,
    publisher: 'CVPR',
    doi: '10.1109/CVPR.2016.90',
    pdfUrl: 'https://arxiv.org/pdf/1512.03385.pdf'
  },
  {
    id: '3',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    publication: 'Proceedings of NAACL-HLT',
    year: 2019,
    pages: '4171-4186',
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers.',
    citations: 145678,
    publisher: 'ACL',
    doi: '10.18653/v1/N19-1423',
    pdfUrl: 'https://arxiv.org/pdf/1810.04805.pdf'
  },
  {
    id: '4',
    title: 'ImageNet Classification with Deep Convolutional Neural Networks',
    authors: ['Alex Krizhevsky', 'Ilya Sutskever', 'Geoffrey E. Hinton'],
    publication: 'Advances in Neural Information Processing Systems',
    year: 2012,
    pages: '1097-1105',
    abstract: 'We trained a large, deep convolutional neural network to classify the 1.2 million high-resolution images in the ImageNet LSVRC-2010 contest.',
    citations: 167890,
    publisher: 'NeurIPS',
    doi: '10.1145/3065386',
    pdfUrl: 'https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'
  },
  {
    id: '5',
    title: 'Generative Adversarial Nets',
    authors: ['Ian J. Goodfellow', 'Jean Pouget-Abadie', 'Mehdi Mirza', 'Bing Xu', 'David Warde-Farley', 'Sherjil Ozair', 'Aaron Courville', 'Yoshua Bengio'],
    publication: 'Advances in Neural Information Processing Systems',
    year: 2014,
    pages: '2672-2680',
    abstract: 'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models.',
    citations: 87654,
    publisher: 'NeurIPS',
    doi: '10.48550/arXiv.1406.2661',
    pdfUrl: 'https://arxiv.org/pdf/1406.2661.pdf'
  },
  {
    id: '6',
    title: 'Adam: A Method for Stochastic Optimization',
    authors: ['Diederik P. Kingma', 'Jimmy Ba'],
    publication: 'International Conference on Learning Representations',
    year: 2015,
    abstract: 'We introduce Adam, an algorithm for first-order gradient-based optimization of stochastic objective functions, based on adaptive estimates of lower-order moments.',
    citations: 198765,
    publisher: 'ICLR',
    doi: '10.48550/arXiv.1412.6980'
  },
  {
    id: '7',
    title: 'Dropout: A Simple Way to Prevent Neural Networks from Overfitting',
    authors: ['Nitish Srivastava', 'Geoffrey Hinton', 'Alex Krizhevsky', 'Ilya Sutskever', 'Ruslan Salakhutdinov'],
    publication: 'Journal of Machine Learning Research',
    year: 2014,
    pages: '1929-1958',
    abstract: 'The key idea is to randomly drop units (along with their connections) from the neural network during training.',
    citations: 65432,
    publisher: 'JMLR',
    doi: '10.5555/2627435.2670313'
  },
  {
    id: '8',
    title: 'Machine Learning in Healthcare: A Review',
    authors: ['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'],
    publication: 'Nature Medicine',
    year: 2023,
    pages: '45-58',
    abstract: 'This comprehensive review examines the current state and future prospects of machine learning applications in healthcare, including diagnosis, treatment planning, and drug discovery.',
    citations: 3456,
    publisher: 'Nature',
    doi: '10.1038/s41591-023-00001-x'
  },
  {
    id: '9',
    title: 'The Effects of Caffeine on Cognitive Performance and Short-Term Memory',
    authors: ['David Smith', 'Lisa Wang', 'Robert Brown'],
    publication: 'Journal of Caffeine Research',
    year: 2022,
    pages: '123-145',
    abstract: 'This study investigates the acute effects of caffeine consumption on short-term memory and cognitive performance in young adults.',
    citations: 892,
    publisher: 'Mary Ann Liebert',
    doi: '10.1089/jcr.2022.0012'
  },
  {
    id: '10',
    title: 'Sleep Quality and Cognitive Function: A Longitudinal Study',
    authors: ['Jennifer Lee', 'Mark Thompson', 'Anna Garcia'],
    publication: 'Sleep Medicine Reviews',
    year: 2023,
    pages: '78-92',
    abstract: 'We examine the relationship between sleep quality metrics and cognitive performance over a 5-year period in adults aged 25-65.',
    citations: 1234,
    publisher: 'Elsevier',
    doi: '10.1016/j.smrv.2023.101789'
  }
];

export const labsResults: LabsResult[] = [
  {
    ...mockPapers[8],
    aiSummary: 'This paper directly examines how caffeine affects short-term memory through controlled experiments.',
    relevancePoints: [
      'Addresses your question about caffeine\'s impact on short-term memory through randomized controlled trials',
      'Provides evidence that moderate caffeine consumption (100-200mg) improves working memory performance',
      'Includes age-specific analysis showing stronger effects in adults 18-35 compared to older adults'
    ]
  },
  {
    ...mockPapers[9],
    aiSummary: 'Explores the relationship between sleep and cognitive performance, relevant to understanding caffeine\'s stimulant effects.',
    relevancePoints: [
      'Provides context on factors affecting short-term memory and cognitive function',
      'Offers comparative data on how stimulants like caffeine interact with sleep-deprived cognitive states',
      'Includes methodology for measuring short-term memory that complements caffeine studies'
    ]
  },
  {
    id: '11',
    title: 'Caffeine and Memory Consolidation: A Meta-Analysis',
    authors: ['Maria Gonzalez', 'James Wilson', 'Sophie Chen'],
    publication: 'Psychopharmacology',
    year: 2023,
    pages: '234-256',
    abstract: 'A comprehensive meta-analysis of 45 studies examining caffeine\'s effects on various memory types, including short-term, working, and long-term memory.',
    citations: 567,
    publisher: 'Springer',
    doi: '10.1007/s00213-023-00045-6',
    aiSummary: 'Meta-analysis synthesizing findings from 45 studies on caffeine and memory.',
    relevancePoints: [
      'Synthesizes evidence from multiple studies on caffeine and short-term memory',
      'Reports a small but significant positive effect (d = 0.28) of caffeine on working memory tasks',
      'Identifies optimal caffeine dosage range (150-300mg) for cognitive enhancement'
    ]
  },
  {
    id: '12',
    title: 'Age-Related Differences in Caffeine Sensitivity and Cognitive Performance',
    authors: ['Robert Taylor', 'Amy Liu', 'Kevin Park'],
    publication: 'Journal of Gerontology: Psychological Sciences',
    year: 2022,
    pages: '445-460',
    abstract: 'This study compares caffeine\'s cognitive effects across different age groups, finding significant variation in sensitivity and response.',
    citations: 423,
    publisher: 'Oxford Academic',
    doi: '10.1093/geronb/gbac089',
    aiSummary: 'Examines how age moderates caffeine\'s effects on cognitive performance.',
    relevancePoints: [
      'Addresses age-specific effects mentioned in your question about caffeine and memory',
      'Shows that younger adults (18-35) demonstrate greater cognitive enhancement from caffeine',
      'Provides evidence that caffeine improves short-term memory retention across all adult age groups'
    ]
  },
  {
    id: '13',
    title: 'Neurobiological Mechanisms of Caffeine-Induced Cognitive Enhancement',
    authors: ['Patricia Adams', 'Thomas Wright', 'Lisa Kim'],
    publication: 'Neuroscience & Biobehavioral Reviews',
    year: 2023,
    pages: '112-128',
    abstract: 'A review of the neurobiological pathways through which caffeine affects cognitive function, focusing on adenosine receptor antagonism.',
    citations: 789,
    publisher: 'Elsevier',
    doi: '10.1016/j.neubiorev.2023.105432',
    aiSummary: 'Explains the biological mechanisms behind caffeine\'s cognitive effects.',
    relevancePoints: [
      'Explains how caffeine blocks adenosine receptors to improve alertness and memory',
      'Describes the neural pathways involved in short-term memory enhancement',
      'Links caffeine\'s mechanism of action to improved cognitive processing speed'
    ]
  }
];

export const savedPapers: SavedPaper[] = [
  {
    ...mockPapers[0],
    savedAt: new Date('2025-01-15'),
    labels: ['Transformers', 'Must Read', 'NLP']
  },
  {
    ...mockPapers[2],
    savedAt: new Date('2025-01-20'),
    labels: ['BERT', 'NLP', 'Pre-training']
  },
  {
    ...mockPapers[7],
    savedAt: new Date('2025-02-01'),
    labels: ['Healthcare', 'ML Applications']
  }
];

export const sampleResearchQuestions = [
  'How does caffeine consumption affect short-term memory?',
  'What are the latest developments in quantum computing?',
  'Find papers on machine learning in healthcare',
  'Explain the relationship between sleep and cognitive performance',
  'What is the impact of social media on mental health?',
  'How do transformers work in natural language processing?'
];

// Real API integration - replaces mock data
import { searchAllAPIs } from '@/services/api';

export const getPapersByQuery = async (query: string): Promise<Paper[]> => {
  try {
    const response = await searchAllAPIs({ query, maxResults: 20 });
    return response.papers;
  } catch (error) {
    console.error('Error fetching papers:', error);
    // Fallback to mock data if API fails
    const lowerQuery = query.toLowerCase();
    return mockPapers.filter(paper => 
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.abstract.toLowerCase().includes(lowerQuery) ||
      paper.authors.some(author => author.toLowerCase().includes(lowerQuery))
    );
  }
};

export const getLabsResultsByQuery = async (query: string): Promise<LabsResult[]> => {
  try {
    // Get real papers from APIs
    const response = await searchAllAPIs({ query, maxResults: 10 });
    
    // Convert to LabsResult with AI summaries
    return response.papers.map(paper => ({
      ...paper,
      aiSummary: `This paper addresses your question about "${query}" by examining ${paper.title.toLowerCase().slice(0, 100)}...`,
      relevancePoints: [
        `Directly relevant to your query: "${query}"`,
        `Published in ${paper.publication} (${paper.year}) with ${paper.citations} citations`,
        paper.abstract ? `Key insight: ${paper.abstract.slice(0, 150)}...` : 'Provides relevant research findings'
      ]
    }));
  } catch (error) {
    console.error('Error fetching labs results:', error);
    // Fallback to mock data
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('caffeine') || lowerQuery.includes('memory')) {
      return labsResults;
    }
    
    return mockPapers.slice(0, 4).map(paper => ({
      ...paper,
      aiSummary: `This paper discusses ${paper.title.toLowerCase()} and its implications for the field.`,
      relevancePoints: [
        `Addresses aspects of your query about ${lowerQuery.slice(0, 30)}...`,
        'Provides relevant theoretical framework and methodology',
        'Offers empirical evidence supporting key findings'
      ]
    }));
  }
};
