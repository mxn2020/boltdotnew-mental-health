//src/components/peer/SupporterProfileForm.tsx

import React, { useState, useEffect } from 'react';
import { Users, Save, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PeerSupporter, peerSupportService } from '../../lib/peerSupport';

interface SupporterProfileFormProps {
  onSave?: (profile: PeerSupporter) => void;
}

export function SupporterProfileForm({ onSave }: SupporterProfileFormProps) {
  const [profile, setProfile] = useState<Partial<PeerSupporter>>({
    supporter_level: 'community',
    experience_months: 0,
    specializations: [],
    availability_hours: {},
    max_concurrent_matches: 3,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewSupporter, setIsNewSupporter] = useState(true);

  const specializationOptions = [
    'Anxiety',
    'Depression',
    'Trauma/PTSD',
    'Grief & Loss',
    'Relationship Issues',
    'Work Stress',
    'Academic Pressure',
    'Family Issues',
    'Addiction Recovery',
    'LGBTQ+ Support',
    'Young Adults',
    'Parenting',
    'Chronic Illness',
    'Life Transitions',
  ];

  useEffect(() => {
    loadSupporterProfile();
  }, []);

  const loadSupporterProfile = async () => {
    setLoading(true);
    const { data } = await peerSupportService.getSupporterProfile();
    if (data) {
      setProfile(data);
      setIsNewSupporter(false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let result;
      if (isNewSupporter) {
        result = await peerSupportService.becomePeerSupporter(profile as any);
      } else {
        result = await peerSupportService.updateSupporterProfile(profile);
      }

      if (result.error) {
        console.error('Error saving supporter profile:', result.error);
        return;
      }

      if (result.data && onSave) {
        onSave(result.data);
      }
      setIsNewSupporter(false);
    } catch (error) {
      console.error('Error saving supporter profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    const current = profile.specializations || [];
    if (current.includes(spec)) {
      setProfile({
        ...profile,
        specializations: current.filter(s => s !== spec),
      });
    } else {
      setProfile({
        ...profile,
        specializations: [...current, spec],
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading supporter profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-teal-600" />
          <span>{isNewSupporter ? 'Become a Peer Supporter' : 'Peer Supporter Profile'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isNewSupporter && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
            <h4 className="font-medium text-teal-900 mb-2">About Peer Support</h4>
            <p className="text-sm text-teal-800">
              Peer supporters provide emotional support and share lived experiences with others facing similar challenges. 
              You'll be matched with people seeking support based on your experience and availability.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Supporter Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Supporter Level
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="community"
                  checked={profile.supporter_level === 'community'}
                  onChange={(e) => setProfile({ ...profile, supporter_level: e.target.value as any })}
                  className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Community Supporter</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Share your lived experience and provide peer-to-peer emotional support
                  </p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="experienced"
                  checked={profile.supporter_level === 'experienced'}
                  onChange={(e) => setProfile({ ...profile, supporter_level: e.target.value as any })}
                  className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Experienced Supporter</span>
                  <p className="text-sm text-gray-600 mt-1">
                    6+ months of peer support experience, can handle more complex situations
                  </p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="certified"
                  checked={profile.supporter_level === 'certified'}
                  onChange={(e) => setProfile({ ...profile, supporter_level: e.target.value as any })}
                  className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Certified Peer Supporter</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Formal peer support certification or mental health training
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Experience */}
          <div>
            <Input
              label="Experience (months)"
              type="number"
              min="0"
              value={profile.experience_months || 0}
              onChange={(e) => setProfile({ ...profile, experience_months: parseInt(e.target.value) || 0 })}
              helperText="How many months of experience do you have providing peer support?"
            />
          </div>

          {/* Specializations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Areas of Experience (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specializationOptions.map((spec) => (
                <label
                  key={spec}
                  className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={profile.specializations?.includes(spec) || false}
                    onChange={() => toggleSpecialization(spec)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{spec}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Input
              label="Maximum Concurrent Matches"
              type="number"
              min="1"
              max="10"
              value={profile.max_concurrent_matches || 3}
              onChange={(e) => setProfile({ ...profile, max_concurrent_matches: parseInt(e.target.value) || 3 })}
              helperText="How many people can you support at the same time?"
            />
          </div>

          {/* Availability Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_active"
              checked={profile.is_active || false}
              onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Currently available to support others
            </label>
          </div>
        </div>

        {!isNewSupporter && profile.total_sessions !== undefined && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Your Impact</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <p className="text-lg font-bold text-teal-600">{profile.total_sessions}</p>
                <p className="text-xs text-teal-700">Total Sessions</p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {profile.average_rating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-purple-700">Average Rating</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-lg font-bold text-green-600">{profile.current_matches}</p>
                <p className="text-xs text-green-700">Active Matches</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving || !profile.specializations?.length}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : isNewSupporter ? 'Become a Peer Supporter' : 'Update Profile'}
          </Button>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Supporter Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Listen without judgment and share your lived experience</li>
            <li>• Respect confidentiality and maintain appropriate boundaries</li>
            <li>• Encourage professional help when needed - you're not a therapist</li>
            <li>• Report any safety concerns to our moderation team</li>
            <li>• Take care of your own mental health first</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}