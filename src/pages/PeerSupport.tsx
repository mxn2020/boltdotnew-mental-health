// src/pages/PeerSupport.tsx

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Plus, Search, Heart, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SupporterProfileForm } from '../components/peer/SupporterProfileForm';
import { PeerMatchCard } from '../components/peer/PeerMatchCard';
import { SupportGroupCard } from '../components/peer/SupportGroupCard';
import { MessageThread } from '../components/peer/MessageThread';
import { 
  PeerSupporter, 
  PeerMatch, 
  SupportGroup, 
  GroupMembership,
  peerSupportService 
} from '../lib/peerSupport';

export function PeerSupport() {
  const [activeTab, setActiveTab] = useState<'find-support' | 'my-matches' | 'groups' | 'become-supporter'>('find-support');
  const [supporterProfile, setSupporterProfile] = useState<PeerSupporter | null>(null);
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [myGroups, setMyGroups] = useState<(GroupMembership & { group: SupportGroup })[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileResult, matchesResult, groupsResult, myGroupsResult] = await Promise.all([
        peerSupportService.getSupporterProfile(),
        peerSupportService.getMyMatches(),
        peerSupportService.getSupportGroups(),
        peerSupportService.getMyGroups()
      ]);

      if (profileResult.data) {
        setSupporterProfile(profileResult.data);
      }
      if (matchesResult.data) {
        setMatches(matchesResult.data);
      }
      if (groupsResult.data) {
        setSupportGroups(groupsResult.data);
      }
      if (myGroupsResult.data) {
        setMyGroups(myGroupsResult.data);
      }
    } catch (error) {
      console.error('Error loading peer support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindSupport = async () => {
    const reason = prompt('Please briefly describe what kind of support you\'re looking for:');
    if (!reason) return;

    try {
      const { data, error } = await peerSupportService.findPeerSupporter({
        match_type: 'one-time',
        reason,
      });

      if (error) {
        alert('No supporters are currently available. Please try again later or join a support group.');
        return;
      }

      if (data) {
        setMatches(prev => [data, ...prev]);
        setActiveTab('my-matches');
        alert('Great! We\'ve found a peer supporter for you. They will be notified of your request.');
      }
    } catch (error) {
      console.error('Error finding support:', error);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await peerSupportService.updateMatchStatus(matchId, 'active');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      await peerSupportService.updateMatchStatus(matchId, 'cancelled');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error declining match:', error);
    }
  };

  const handleCompleteMatch = async (matchId: string) => {
    try {
      await peerSupportService.updateMatchStatus(matchId, 'completed');
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error completing match:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await peerSupportService.joinSupportGroup(groupId);
      loadData(); // Refresh data
      alert('Successfully joined the support group!');
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Unable to join group. It may be full or you may already be a member.');
    }
  };

  const filteredGroups = supportGroups.filter(group => {
    const matchesSearch = searchQuery === '' || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Groups' },
    { id: 'anxiety', label: 'Anxiety' },
    { id: 'depression', label: 'Depression' },
    { id: 'trauma', label: 'Trauma' },
    { id: 'grief', label: 'Grief & Loss' },
    { id: 'general', label: 'General' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading peer support...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer Support</h1>
        <p className="text-gray-600">
          Connect with others who understand your journey through anonymous, secure peer support
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('find-support')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'find-support'
                ? 'bg-white text-teal-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="h-5 w-5" />
            <span>Find Support</span>
          </button>
          <button
            onClick={() => setActiveTab('my-matches')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'my-matches'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="h-5 w-5" />
            <span>My Matches ({matches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'groups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Support Groups</span>
          </button>
          <button
            onClick={() => setActiveTab('become-supporter')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'become-supporter'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="h-5 w-5" />
            <span>Become Supporter</span>
          </button>
        </div>
      </div>

      {/* Find Support Tab */}
      {activeTab === 'find-support' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Get One-on-One Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Connect with a trained peer supporter who has lived experience with mental health challenges. 
                All conversations are anonymous and encrypted.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <Heart className="h-8 w-8 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-medium text-teal-900 mb-2">Anonymous & Safe</h3>
                  <p className="text-sm text-teal-700">
                    Your identity remains completely private throughout the conversation
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-medium text-purple-900 mb-2">Lived Experience</h3>
                  <p className="text-sm text-purple-700">
                    Connect with people who truly understand what you're going through
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-medium text-green-900 mb-2">Trained Supporters</h3>
                  <p className="text-sm text-green-700">
                    All supporters complete training in peer support best practices
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <Button onClick={handleFindSupport} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Find a Peer Supporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Matches Tab */}
      {activeTab === 'my-matches' && (
        <div className="space-y-6">
          {matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600 mb-6">
                  Request support to get matched with a peer supporter, or become a supporter yourself
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setActiveTab('find-support')}>
                    Find Support
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('become-supporter')}>
                    Become Supporter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map((match) => (
                <PeerMatchCard
                  key={match.id}
                  match={match}
                  isSupporter={!!supporterProfile}
                  onAccept={handleAcceptMatch}
                  onDecline={handleDeclineMatch}
                  onMessage={(matchId) => setSelectedMatch(matchId)}
                  onComplete={handleCompleteMatch}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Support Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* My Groups */}
          {myGroups.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Groups</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {myGroups.map((membership) => (
                  <SupportGroupCard
                    key={membership.id}
                    group={membership.group}
                    isMember={true}
                    onEnter={(groupId) => setSelectedGroup(groupId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search groups..."
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
                {category.label}
              </button>
            ))}
          </div>

          {/* Available Groups */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Groups</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGroups.map((group) => {
                const isMember = myGroups.some(mg => mg.group_id === group.id);
                return (
                  <SupportGroupCard
                    key={group.id}
                    group={group}
                    isMember={isMember}
                    onJoin={handleJoinGroup}
                    onEnter={(groupId) => setSelectedGroup(groupId)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Become Supporter Tab */}
      {activeTab === 'become-supporter' && (
        <div className="max-w-4xl mx-auto">
          <SupporterProfileForm onSave={(profile) => setSupporterProfile(profile)} />
        </div>
      )}

      {/* Message Thread Modal */}
      {selectedMatch && (
        <MessageThread
          matchId={selectedMatch}
          title="Peer Support Conversation"
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {/* Group Chat Modal */}
      {selectedGroup && (
        <MessageThread
          groupId={selectedGroup}
          title="Support Group Chat"
          isGroup={true}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}