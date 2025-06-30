//src/components/tools/SafetyPlanForm.tsx

import React, { useState, useEffect } from 'react';
import { Shield, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SafetyPlan, copingToolsService } from '../../lib/copingTools';

interface SafetyPlanFormProps {
  onSave?: (plan: SafetyPlan) => void;
}

export function SafetyPlanForm({ onSave }: SafetyPlanFormProps) {
  const [plan, setPlan] = useState<Partial<SafetyPlan>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSafetyPlan();
  }, []);

  const loadSafetyPlan = async () => {
    setLoading(true);
    const { data } = await copingToolsService.getSafetyPlan();
    if (data) {
      setPlan(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await copingToolsService.saveSafetyPlan(plan);
      if (error) {
        console.error('Error saving safety plan:', error);
        return;
      }
      if (data && onSave) {
        onSave(data);
      }
    } catch (error) {
      console.error('Error saving safety plan:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading safety plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-teal-600" />
          <span>Personal Safety Plan</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">About Safety Plans</p>
              <p>
                A safety plan is a personalized, practical plan that can help you lower your risk of future suicidal thoughts and actions. 
                It's designed to help you recognize warning signs and know what to do to keep yourself safe.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Warning Signs */}
          <div>
            <Input
              label="1. Warning Signs"
              placeholder="Thoughts, feelings, behaviors that indicate a crisis may be developing..."
              value={plan.warning_signs || ''}
              onChange={(e) => setPlan({ ...plan, warning_signs: e.target.value })}
              helperText="Examples: feeling hopeless, isolating from others, increased substance use"
            />
          </div>

          {/* Coping Strategies */}
          <div>
            <Input
              label="2. Internal Coping Strategies"
              placeholder="Things I can do to take my mind off my problems without contacting another person..."
              value={plan.coping_strategies || ''}
              onChange={(e) => setPlan({ ...plan, coping_strategies: e.target.value })}
              helperText="Examples: listen to music, take a walk, practice breathing exercises"
            />
          </div>

          {/* Support Contacts */}
          <div>
            <Input
              label="3. People and Social Settings"
              placeholder="People I can ask for help and places I can go for distraction..."
              value={plan.support_contacts || ''}
              onChange={(e) => setPlan({ ...plan, support_contacts: e.target.value })}
              helperText="Include names and phone numbers of trusted friends, family, or support groups"
            />
          </div>

          {/* Professional Contacts */}
          <div>
            <Input
              label="4. Professional Contacts"
              placeholder="Mental health professionals and agencies I can contact during a crisis..."
              value={plan.professional_contacts || ''}
              onChange={(e) => setPlan({ ...plan, professional_contacts: e.target.value })}
              helperText="Include therapist, psychiatrist, crisis hotlines (988), emergency services (911)"
            />
          </div>

          {/* Environment Safety */}
          <div>
            <Input
              label="5. Making the Environment Safe"
              placeholder="Ways to remove or restrict access to lethal means..."
              value={plan.environment_safety || ''}
              onChange={(e) => setPlan({ ...plan, environment_safety: e.target.value })}
              helperText="Examples: remove weapons, medications, or other means; ask someone to hold them"
            />
          </div>

          {/* Reasons to Live */}
          <div>
            <Input
              label="6. Reasons for Living"
              placeholder="Things that are important to me and worth living for..."
              value={plan.reasons_to_live || ''}
              onChange={(e) => setPlan({ ...plan, reasons_to_live: e.target.value })}
              helperText="Examples: family, pets, goals, values, future plans"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Safety Plan'}
          </Button>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">Crisis Resources</p>
            <p className="mb-2">If you're having thoughts of suicide or self-harm, please reach out for help immediately:</p>
            <ul className="space-y-1">
              <li>• National Suicide Prevention Lifeline: <strong>988</strong></li>
              <li>• Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></li>
              <li>• Emergency Services: <strong>911</strong></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}