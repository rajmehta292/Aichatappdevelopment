import { Skill } from '../types/chat';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Search,
  Code,
  Image,
  Database,
  Globe,
  Zap,
  Lock,
} from 'lucide-react';

interface SkillsManagerProps {
  skills: Skill[];
  onToggleSkill: (id: string, enabled: boolean) => void;
}

const SKILL_ICONS = {
  search: Search,
  code: Code,
  image: Image,
  data: Database,
  web: Globe,
  other: Zap,
};

export function SkillsManager({ skills, onToggleSkill }: SkillsManagerProps) {
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const enabledCount = skills.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">AI Skills & Capabilities</h3>
        <p className="text-sm text-zinc-500">
          Enable or disable specific AI capabilities
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">{enabledCount}</div>
              <div className="text-xs text-zinc-500">Active Skills</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-zinc-500">
                {skills.length} total available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => {
          const Icon = SKILL_ICONS[category as keyof typeof SKILL_ICONS] || Zap;
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon size={16} />
                  {category.charAt(0).toUpperCase() + category.slice(1)} Skills
                </CardTitle>
                <CardDescription>
                  {categorySkills.filter((s) => s.enabled).length} of{' '}
                  {categorySkills.length} enabled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-start justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm">{skill.name}</div>
                        {skill.requiresApi && (
                          <Badge variant="outline" className="text-xs">
                            <Lock size={10} className="mr-1" />
                            Requires API
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {skill.description}
                      </div>
                    </div>
                    <Switch
                      checked={skill.enabled}
                      onCheckedChange={(checked) =>
                        onToggleSkill(skill.id, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
