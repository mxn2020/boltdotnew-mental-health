//src/pages/CopingTools.tsx
import React, { useState, useEffect } from 'react';
import { Heart, Filter, Search, Shield, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ToolCard } from '../components/tools/ToolCard';
import { ToolSession } from '../components/tools/ToolSession';
import { SafetyPlanForm } from '../components/tools/SafetyPlanForm';
import { CrisisResourceCard } from '../components/tools/CrisisResourceCard';
import { CopingTool, CrisisResource, copingToolsService } from '../lib/copingTools';

export function CopingTools() {
  const [tools, setTools] = useState<CopingTool[]>([]);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const [filteredTools, setFilteredTools] = useState<CopingTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<CopingTool | null>(null);
  const [activeTab, setActiveTab] = useState<'tools' | 'crisis' | 'safety'>('tools');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [effectiveness, setEffectiveness] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toolsResult, crisisResult, effectivenessResult] = await Promise.all([
        copingToolsService.getCopingTools(),
        copingToolsService.getCrisisResources(),
        copingToolsService.getToolEffectiveness()
      ]);

      if (toolsResult.data) {
        setTools(toolsResult.data);
      }
      if (crisisResult.data) {
        setCrisisResources(crisisResult.data);
      }
      if (effectivenessResult.data) {
        setEffectiveness(effectivenessResult.data);
      }
    } catch (error) {
      console.error('Error loading coping tools data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = tools;

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'crisis') {
        filtered = filtered.filter(tool => tool.is_crisis_tool);
      } else {
        filtered = filtered.filter(tool => tool.category === selectedCategory);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTools(filtered);
  };

  const getToolEffectiveness = (toolId: string) => {
    const stats = effectiveness.find(e => e.tool_id === toolId);
    return stats ? {
      effectiveness: stats.avg_effectiveness,
      usageCount: stats.usage_count
    } : undefined;
  };

  const handleToolComplete = (effectiveness: number, notes?: string, moodBefore?: number, moodAfter?: number) => {
    setSelectedTool(null);
    // Reload effectiveness data
    loadData();
  };

  const categories = [
    { id: 'all', label: 'All Tools', count: tools.length },
    { id: 'crisis', label: 'Crisis Tools', count: tools.filter(t => t.is_crisis_tool).length },
    { id: 'breathing', label: 'Breathing', count: tools.filter(t => t.category === 'breathing').length },
    { id: 'mindfulness', label: 'Mindfulness', count: tools.filter(t => t.category === 'mindfulness').length },
    { id: 'grounding', label: 'Grounding', count: tools.filter(t => t.category === 'grounding').length },
    { id: 'cbt', label: 'CBT', count: tools.filter(t => t.category === 'cbt').length },
    { id: 'dbt', label: 'DBT', count: tools.filter(t => t.category === 'dbt').length },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coping tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coping Tools & Crisis Support</h1>
        <p className="text-gray-600">
          Evidence-based tools and resources to help you manage difficult emotions and situations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'tools'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Coping Tools</span>
          </button>
          <button
            onClick={() => setActiveTab('crisis')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'crisis'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Crisis Resources</span>
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'safety'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Safety Plan</span>
          </button>
        </div>
      </div>

      {/* Coping Tools Tab */}
      {activeTab === 'tools' && (
        <>
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-teal-100 text-teal-700 border-2 border-teal-200'
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {effectiveness.length > 0 && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>Your Most Effective Tools</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {effectiveness
                      .sort((a, b) => b.avg_effectiveness - a.avg_effectiveness)
                      .slice(0, 3)
                      .map((stats) => (
                        <div key={stats.tool_id} className="text-center p-4 bg-teal-50 rounded-lg">
                          <h4 className="font-medium text-teal-900">{stats.tool_name}</h4>
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold text-teal-600">
                              {stats.avg_effectiveness.toFixed(1)}/5
                            </span>
                          </div>
                          <p className="text-xs text-teal-700 mt-1">
                            Used {stats.usage_count} times
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const stats = getToolEffectiveness(tool.id);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onUse={setSelectedTool}
                  effectiveness={stats?.effectiveness}
                  usageCount={stats?.usageCount}
                />
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tools found matching your criteria</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Crisis Resources Tab */}
      {activeTab === 'crisis' && (
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Crisis Support Available 24/7</p>
                <p>
                  If you're having thoughts of suicide or self-harm, please reach out for help immediately. 
                  These resources are available 24/7 and staffed by trained professionals.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {crisisResources.map((resource) => (
              <CrisisResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Safety Plan Tab */}
      {activeTab === 'safety' && (
        <div className="max-w-4xl mx-auto">
          <SafetyPlanForm />
        </div>
      )}

      {/* Tool Session Modal */}
      {selectedTool && (
        <ToolSession
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          onComplete={handleToolComplete}
        />
      )}
    </div>
  );
}