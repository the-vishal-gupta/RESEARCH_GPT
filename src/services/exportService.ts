import type { Paper } from '@/types';

export type ExportFormat = 'bibtex' | 'csv' | 'ris' | 'json';

const generateBibTeX = (papers: Paper[]): string => {
  return papers.map(p => {
    const citationKey = p.doi ? p.doi.split('/')[1] : p.id;
    const authorsList = p.authors.slice(0, 3).join(' and ');
    const etAl = p.authors.length > 3 ? ' and others' : '';

    return `@article{${citationKey},
  title={${p.title}},
  author={${authorsList}${etAl}},
  journal={${p.publication}},
  year={${p.year}},
  doi={${p.doi || 'N/A'}}
}`;
  }).join('\n\n');
};

const generateCSV = (papers: Paper[]): string => {
  const headers = ['Title', 'Authors', 'Publication', 'Year', 'DOI', 'Citations', 'PDF URL'];
  const rows = papers.map(p => [
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.authors.join('; ')}"`,
    `"${p.publication}"`,
    p.year,
    p.doi || '',
    p.citations,
    p.pdfUrl || ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const generateRIS = (papers: Paper[]): string => {
  return papers.map(p => {
    const authorLines = p.authors.map(a => `AU  - ${a}`).join('\n');
    return `TY  - JOUR
${authorLines}
TI  - ${p.title}
JO  - ${p.publication}
PY  - ${p.year}
DO  - ${p.doi || 'N/A'}
ER  - `;
  }).join('\n\n');
};

export const exportService = {
  exportPapers: (papers: Paper[], format: ExportFormat): string => {
    switch (format) {
      case 'bibtex':
        return generateBibTeX(papers);
      case 'csv':
        return generateCSV(papers);
      case 'ris':
        return generateRIS(papers);
      case 'json':
        return JSON.stringify(papers, null, 2);
      default:
        return JSON.stringify(papers);
    }
  },

  downloadFile: (content: string, filename: string): void => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  getFileExtension: (format: ExportFormat): string => {
    const extensions: Record<ExportFormat, string> = {
      bibtex: 'bib',
      csv: 'csv',
      ris: 'ris',
      json: 'json'
    };
    return extensions[format];
  }
};
