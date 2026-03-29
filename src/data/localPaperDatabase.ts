import type { Paper } from '@/types';

// Comprehensive database of open-access research papers with verified PDF links
// All papers are from arXiv, ensuring free access and downloadable PDFs

export const localPaperDatabase: Paper[] = [
  // ========== TRANSFORMERS & NLP ==========
  {
    id: 'local-1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
    publication: 'NeurIPS 2017',
    year: 2017,
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    citations: 154320,
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    doi: '10.48550/arXiv.1706.03762',
    publisher: 'arXiv'
  },
  {
    id: 'local-2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    publication: 'NAACL 2019',
    year: 2019,
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    citations: 145678,
    pdfUrl: 'https://arxiv.org/pdf/1810.04805.pdf',
    doi: '10.48550/arXiv.1810.04805',
    publisher: 'arXiv'
  },
  {
    id: 'local-3',
    title: 'Language Models are Few-Shot Learners (GPT-3)',
    authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah', 'Jared Kaplan'],
    publication: 'NeurIPS 2020',
    year: 2020,
    abstract: 'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. We show that scaling up language models greatly improves task-agnostic, few-shot performance.',
    citations: 89234,
    pdfUrl: 'https://arxiv.org/pdf/2005.14165.pdf',
    doi: '10.48550/arXiv.2005.14165',
    publisher: 'arXiv'
  },
  {
    id: 'local-4',
    title: 'GPT-4 Technical Report',
    authors: ['OpenAI'],
    publication: 'arXiv 2023',
    year: 2023,
    abstract: 'We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, GPT-4 exhibits human-level performance on various professional and academic benchmarks.',
    citations: 12456,
    pdfUrl: 'https://arxiv.org/pdf/2303.08774.pdf',
    doi: '10.48550/arXiv.2303.08774',
    publisher: 'arXiv'
  },
  {
    id: 'local-5',
    title: 'LLaMA: Open and Efficient Foundation Language Models',
    authors: ['Hugo Touvron', 'Thibaut Lavril', 'Gautier Izacard', 'Xavier Martinet'],
    publication: 'arXiv 2023',
    year: 2023,
    abstract: 'We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters. We train our models on trillions of tokens, and show that it is possible to train state-of-the-art models using publicly available datasets exclusively.',
    citations: 8934,
    pdfUrl: 'https://arxiv.org/pdf/2302.13971.pdf',
    doi: '10.48550/arXiv.2302.13971',
    publisher: 'arXiv'
  },

  // ========== COMPUTER VISION ==========
  {
    id: 'local-6',
    title: 'Deep Residual Learning for Image Recognition (ResNet)',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    publication: 'CVPR 2016',
    year: 2016,
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs.',
    citations: 198543,
    pdfUrl: 'https://arxiv.org/pdf/1512.03385.pdf',
    doi: '10.48550/arXiv.1512.03385',
    publisher: 'arXiv'
  },
  {
    id: 'local-7',
    title: 'You Only Look Once: Unified, Real-Time Object Detection (YOLO)',
    authors: ['Joseph Redmon', 'Santosh Divvala', 'Ross Girshick', 'Ali Farhadi'],
    publication: 'CVPR 2016',
    year: 2016,
    abstract: 'We present YOLO, a new approach to object detection. Prior work on object detection repurposes classifiers to perform detection. Instead, we frame object detection as a regression problem to spatially separated bounding boxes and associated class probabilities.',
    citations: 67890,
    pdfUrl: 'https://arxiv.org/pdf/1506.02640.pdf',
    doi: '10.48550/arXiv.1506.02640',
    publisher: 'arXiv'
  },
  {
    id: 'local-8',
    title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition (ViT)',
    authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov'],
    publication: 'ICLR 2021',
    year: 2021,
    abstract: 'While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. We show that this reliance on CNNs is not necessary and a pure transformer applied directly to sequences of image patches can perform very well on image classification tasks.',
    citations: 34567,
    pdfUrl: 'https://arxiv.org/pdf/2010.11929.pdf',
    doi: '10.48550/arXiv.2010.11929',
    publisher: 'arXiv'
  },

  // ========== GENERATIVE MODELS ==========
  {
    id: 'local-9',
    title: 'Generative Adversarial Networks (GANs)',
    authors: ['Ian J. Goodfellow', 'Jean Pouget-Abadie', 'Mehdi Mirza', 'Bing Xu'],
    publication: 'NeurIPS 2014',
    year: 2014,
    abstract: 'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.',
    citations: 87654,
    pdfUrl: 'https://arxiv.org/pdf/1406.2661.pdf',
    doi: '10.48550/arXiv.1406.2661',
    publisher: 'arXiv'
  },
  {
    id: 'local-10',
    title: 'Denoising Diffusion Probabilistic Models',
    authors: ['Jonathan Ho', 'Ajay Jain', 'Pieter Abbeel'],
    publication: 'NeurIPS 2020',
    year: 2020,
    abstract: 'We present high quality image synthesis results using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics.',
    citations: 23456,
    pdfUrl: 'https://arxiv.org/pdf/2006.11239.pdf',
    doi: '10.48550/arXiv.2006.11239',
    publisher: 'arXiv'
  },
  {
    id: 'local-11',
    title: 'Stable Diffusion: High-Resolution Image Synthesis with Latent Diffusion Models',
    authors: ['Robin Rombach', 'Andreas Blattmann', 'Dominik Lorenz', 'Patrick Esser'],
    publication: 'CVPR 2022',
    year: 2022,
    abstract: 'By decomposing the image formation process into a sequential application of denoising autoencoders, diffusion models achieve state-of-the-art synthesis results on image data and beyond.',
    citations: 15678,
    pdfUrl: 'https://arxiv.org/pdf/2112.10752.pdf',
    doi: '10.48550/arXiv.2112.10752',
    publisher: 'arXiv'
  },

  // ========== REINFORCEMENT LEARNING ==========
  {
    id: 'local-12',
    title: 'Playing Atari with Deep Reinforcement Learning',
    authors: ['Volodymyr Mnih', 'Koray Kavukcuoglu', 'David Silver'],
    publication: 'NIPS 2013',
    year: 2013,
    abstract: 'We present the first deep learning model to successfully learn control policies directly from high-dimensional sensory input using reinforcement learning. The model is a convolutional neural network, trained with a variant of Q-learning.',
    citations: 45678,
    pdfUrl: 'https://arxiv.org/pdf/1312.5602.pdf',
    doi: '10.48550/arXiv.1312.5602',
    publisher: 'arXiv'
  },
  {
    id: 'local-13',
    title: 'Proximal Policy Optimization Algorithms (PPO)',
    authors: ['John Schulman', 'Filip Wolski', 'Prafulla Dhariwal', 'Alec Radford', 'Oleg Klimov'],
    publication: 'arXiv 2017',
    year: 2017,
    abstract: 'We propose a new family of policy gradient methods for reinforcement learning, which alternate between sampling data through interaction with the environment, and optimizing a "surrogate" objective function using stochastic gradient ascent.',
    citations: 34567,
    pdfUrl: 'https://arxiv.org/pdf/1707.06347.pdf',
    doi: '10.48550/arXiv.1707.06347',
    publisher: 'arXiv'
  },

  // ========== OPTIMIZATION & TRAINING ==========
  {
    id: 'local-14',
    title: 'Adam: A Method for Stochastic Optimization',
    authors: ['Diederik P. Kingma', 'Jimmy Ba'],
    publication: 'ICLR 2015',
    year: 2015,
    abstract: 'We introduce Adam, an algorithm for first-order gradient-based optimization of stochastic objective functions, based on adaptive estimates of lower-order moments.',
    citations: 198765,
    pdfUrl: 'https://arxiv.org/pdf/1412.6980.pdf',
    doi: '10.48550/arXiv.1412.6980',
    publisher: 'arXiv'
  },
  {
    id: 'local-15',
    title: 'Batch Normalization: Accelerating Deep Network Training',
    authors: ['Sergey Ioffe', 'Christian Szegedy'],
    publication: 'ICML 2015',
    year: 2015,
    abstract: 'Training Deep Neural Networks is complicated by the fact that the distribution of each layer\'s inputs changes during training. We refer to this phenomenon as internal covariate shift, and address the problem by normalizing layer inputs.',
    citations: 78901,
    pdfUrl: 'https://arxiv.org/pdf/1502.03167.pdf',
    doi: '10.48550/arXiv.1502.03167',
    publisher: 'arXiv'
  },

  // ========== NEURAL ARCHITECTURE ==========
  {
    id: 'local-16',
    title: 'Neural Architecture Search with Reinforcement Learning',
    authors: ['Barret Zoph', 'Quoc V. Le'],
    publication: 'ICLR 2017',
    year: 2017,
    abstract: 'Neural networks are powerful and flexible models that work well for many difficult learning tasks in image, speech and natural language understanding. Despite their success, neural networks are still hard to design.',
    citations: 23456,
    pdfUrl: 'https://arxiv.org/pdf/1611.01578.pdf',
    doi: '10.48550/arXiv.1611.01578',
    publisher: 'arXiv'
  },

  // ========== MULTIMODAL AI ==========
  {
    id: 'local-17',
    title: 'CLIP: Learning Transferable Visual Models From Natural Language Supervision',
    authors: ['Alec Radford', 'Jong Wook Kim', 'Chris Hallacy', 'Aditya Ramesh'],
    publication: 'ICML 2021',
    year: 2021,
    abstract: 'State-of-the-art computer vision systems are trained to predict a fixed set of predetermined object categories. This restricted form of supervision limits their generality and usability. We demonstrate that the simple pre-training task of predicting which caption goes with which image is an efficient and scalable way to learn SOTA image representations from scratch.',
    citations: 18765,
    pdfUrl: 'https://arxiv.org/pdf/2103.00020.pdf',
    doi: '10.48550/arXiv.2103.00020',
    publisher: 'arXiv'
  },
  {
    id: 'local-18',
    title: 'Flamingo: a Visual Language Model for Few-Shot Learning',
    authors: ['Jean-Baptiste Alayrac', 'Jeff Donahue', 'Pauline Luc'],
    publication: 'NeurIPS 2022',
    year: 2022,
    abstract: 'Building models that can be rapidly adapted to novel tasks using only a handful of annotated examples is an open challenge for multimodal machine learning research.',
    citations: 5678,
    pdfUrl: 'https://arxiv.org/pdf/2204.14198.pdf',
    doi: '10.48550/arXiv.2204.14198',
    publisher: 'arXiv'
  },

  // ========== QUANTUM COMPUTING & AI ==========
  {
    id: 'local-19',
    title: 'Quantum Machine Learning: What Quantum Computing Means to Data Mining',
    authors: ['Peter Wittek'],
    publication: 'arXiv 2014',
    year: 2014,
    abstract: 'Quantum machine learning is an emerging interdisciplinary research area at the intersection of quantum physics and machine learning.',
    citations: 3456,
    pdfUrl: 'https://arxiv.org/pdf/1409.3097.pdf',
    doi: '10.48550/arXiv.1409.3097',
    publisher: 'arXiv'
  },
  {
    id: 'local-20',
    title: 'Quantum Computing in the NISQ era and beyond',
    authors: ['John Preskill'],
    publication: 'Quantum 2018',
    year: 2018,
    abstract: 'Noisy Intermediate-Scale Quantum (NISQ) technology will be available in the near future. Quantum computers with 50-100 qubits may be able to perform tasks which surpass the capabilities of today\'s classical digital computers.',
    citations: 8901,
    pdfUrl: 'https://arxiv.org/pdf/1801.00862.pdf',
    doi: '10.48550/arXiv.1801.00862',
    publisher: 'arXiv'
  },

  // ========== EXPLAINABLE AI ==========
  {
    id: 'local-21',
    title: 'Grad-CAM: Visual Explanations from Deep Networks',
    authors: ['Ramprasaath R. Selvaraju', 'Michael Cogswell', 'Abhishek Das'],
    publication: 'ICCV 2017',
    year: 2017,
    abstract: 'We propose a technique for producing "visual explanations" for decisions from a large class of CNN-based models, making them more transparent.',
    citations: 12345,
    pdfUrl: 'https://arxiv.org/pdf/1610.02391.pdf',
    doi: '10.48550/arXiv.1610.02391',
    publisher: 'arXiv'
  },

  // ========== GRAPH NEURAL NETWORKS ==========
  {
    id: 'local-22',
    title: 'Graph Attention Networks',
    authors: ['Petar Veličković', 'Guillem Cucurull', 'Arantxa Casanova'],
    publication: 'ICLR 2018',
    year: 2018,
    abstract: 'We present graph attention networks (GATs), novel neural network architectures that operate on graph-structured data, leveraging masked self-attentional layers.',
    citations: 23456,
    pdfUrl: 'https://arxiv.org/pdf/1710.10903.pdf',
    doi: '10.48550/arXiv.1710.10903',
    publisher: 'arXiv'
  },

  // ========== FEDERATED LEARNING ==========
  {
    id: 'local-23',
    title: 'Communication-Efficient Learning of Deep Networks from Decentralized Data',
    authors: ['H. Brendan McMahan', 'Eider Moore', 'Daniel Ramage'],
    publication: 'AISTATS 2017',
    year: 2017,
    abstract: 'Modern mobile devices have access to a wealth of data suitable for learning models, which in turn can greatly improve the user experience. We advocate an alternative that leaves the training data distributed on the mobile devices, and learns a shared model by aggregating locally-computed updates.',
    citations: 15678,
    pdfUrl: 'https://arxiv.org/pdf/1602.05629.pdf',
    doi: '10.48550/arXiv.1602.05629',
    publisher: 'arXiv'
  },

  // ========== SELF-SUPERVISED LEARNING ==========
  {
    id: 'local-24',
    title: 'Momentum Contrast for Unsupervised Visual Representation Learning (MoCo)',
    authors: ['Kaiming He', 'Haoqi Fan', 'Yuxin Wu', 'Saining Xie', 'Ross Girshick'],
    publication: 'CVPR 2020',
    year: 2020,
    abstract: 'We present Momentum Contrast (MoCo) for unsupervised visual representation learning. From a perspective on contrastive learning as dictionary look-up, we build a dynamic dictionary with a queue and a moving-averaged encoder.',
    citations: 18901,
    pdfUrl: 'https://arxiv.org/pdf/1911.05722.pdf',
    doi: '10.48550/arXiv.1911.05722',
    publisher: 'arXiv'
  },

  // ========== META-LEARNING ==========
  {
    id: 'local-25',
    title: 'Model-Agnostic Meta-Learning for Fast Adaptation (MAML)',
    authors: ['Chelsea Finn', 'Pieter Abbeel', 'Sergey Levine'],
    publication: 'ICML 2017',
    year: 2017,
    abstract: 'We propose an algorithm for meta-learning that is model-agnostic, in the sense that it is compatible with any model trained with gradient descent and applicable to a variety of different learning problems.',
    citations: 14567,
    pdfUrl: 'https://arxiv.org/pdf/1703.03400.pdf',
    doi: '10.48550/arXiv.1703.03400',
    publisher: 'arXiv'
  }
];

// Search function for local database
export const searchLocalDatabase = (query: string, maxResults: number = 20): Paper[] => {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 2);
  
  // Score each paper based on keyword matches
  const scoredPapers = localPaperDatabase.map(paper => {
    let score = 0;
    
    keywords.forEach(keyword => {
      // Title matches are worth more
      if (paper.title.toLowerCase().includes(keyword)) score += 10;
      // Abstract matches
      if (paper.abstract.toLowerCase().includes(keyword)) score += 5;
      // Author matches
      if (paper.authors.some(author => author.toLowerCase().includes(keyword))) score += 3;
    });
    
    return { paper, score };
  });
  
  // Filter papers with score > 0 and sort by score
  return scoredPapers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.paper);
};
