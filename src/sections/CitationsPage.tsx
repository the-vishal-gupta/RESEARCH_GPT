import { useState } from 'react';
import { User, FileText, Quote, BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function CitationsPage() {
  const [timeRange, setTimeRange] = useState<'all' | '5years' | 'year'>('all');

  // Mock user profile data
  const profile = {
    name: 'Vishal Gupta',
    affiliation: 'AI/ML Department',
    email: 'vishal.gupta@aiml.edu',
    hIndex: 12,
    i10Index: 8,
    totalCitations: 456,
    publications: 15,
    since2019: 456,
  };

  // Mock publications data
  const publications = [
    {
      title: 'Machine Learning Applications in Healthcare Systems',
      authors: ['V Gupta', 'A Kumar', 'S Sharma'],
      venue: 'International Journal of AI Research',
      year: 2023,
      citations: 89,
      type: 'Article',
    },
    {
      title: 'Deep Learning for Image Classification',
      authors: ['V Gupta', 'R Singh'],
      venue: 'IEEE Conference on AI',
      year: 2023,
      citations: 67,
      type: 'Conference Paper',
    },
    {
      title: 'Natural Language Processing with Transformers',
      authors: ['V Gupta', 'M Patel', 'K Verma'],
      venue: 'ACM Computing Surveys',
      year: 2022,
      citations: 124,
      type: 'Survey',
    },
    {
      title: 'Reinforcement Learning in Robotics',
      authors: ['V Gupta', 'D Mehta'],
      venue: 'Robotics and Automation Conference',
      year: 2022,
      citations: 98,
      type: 'Conference Paper',
    },
    {
      title: 'AI Ethics and Responsible Machine Learning',
      authors: ['V Gupta'],
      venue: 'Journal of AI Ethics',
      year: 2021,
      citations: 78,
      type: 'Article',
    },
  ];

  const citationHistory = [
    { year: '2019', citations: 12 },
    { year: '2020', citations: 45 },
    { year: '2021', citations: 98 },
    { year: '2022', citations: 156 },
    { year: '2023', citations: 145 },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f8f9fa]">
      {/* Profile Header */}
      <div className="bg-white border-b border-[#dadce0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 bg-[#4285f4]">
              <AvatarFallback className="text-3xl text-white">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-[#202124] mb-2">
                {profile.name}
              </h1>
              <p className="text-[#5f6368] mb-1">{profile.affiliation}</p>
              <p className="text-sm text-[#5f6368]">{profile.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary" className="bg-[#e8f0fe] text-[#1967d2]">
                  Artificial Intelligence
                </Badge>
                <Badge variant="secondary" className="bg-[#e8f0fe] text-[#1967d2]">
                  Machine Learning
                </Badge>
                <Badge variant="secondary" className="bg-[#e8f0fe] text-[#1967d2]">
                  Deep Learning
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button className="bg-[#4285f4]">
                <FileText className="w-4 h-4 mr-2" />
                Add Publication
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#5f6368] font-normal">
                All-time citations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[#202124]">
                {profile.totalCitations.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#5f6368] font-normal">
                h-index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[#202124]">{profile.hIndex}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#5f6368] font-normal">
                i10-index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[#202124]">{profile.i10Index}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#5f6368] font-normal">
                Publications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-medium text-[#202124]">{profile.publications}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Publications List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4285f4]" />
                    Publications
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={timeRange === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('all')}
                    >
                      All time
                    </Button>
                    <Button 
                      variant={timeRange === '5years' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('5years')}
                    >
                      Since 2019
                    </Button>
                    <Button 
                      variant={timeRange === 'year' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange('year')}
                    >
                      This year
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publications.map((pub, index) => (
                    <div key={index} className="p-4 bg-[#f8f9fa] rounded-lg">
                      <h3 className="font-medium text-[#1a0dab] hover:underline cursor-pointer mb-2">
                        {pub.title}
                      </h3>
                      <p className="text-sm text-[#5f6368] mb-1">
                        {pub.authors.join(', ')}
                      </p>
                      <p className="text-sm text-[#5f6368] mb-2">
                        <span className="italic">{pub.venue}</span>, {pub.year}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm gs-green">
                          Cited by {pub.citations}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Quote className="w-4 h-4 mr-1" />
                          Cite
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Citation Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#4285f4]" />
                  Citation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {citationHistory.map((item) => (
                    <div key={item.year} className="flex items-center gap-3">
                      <span className="text-sm text-[#5f6368] w-12">{item.year}</span>
                      <div className="flex-1 h-6 bg-[#e8eaed] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4285f4] rounded-full transition-all"
                          style={{ width: `${(item.citations / 200) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#202124] w-16 text-right">
                        {item.citations}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Co-authors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-[#4285f4]" />
                  Co-authors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['A Kumar', 'R Singh', 'M Patel', 'K Verma', 'D Mehta'].map((name) => (
                    <div key={name} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 bg-[#34a853]">
                        <AvatarFallback className="text-xs text-white">
                          {name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-[#202124]">{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
