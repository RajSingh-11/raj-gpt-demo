import { ChevronDown, ChevronUp, Gamepad2, Music, Globe, User, Mic, Search } from 'lucide-react';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import useStore, { type Persona, type MusicTool } from '../lib/state';

const personas: Persona[] = ['Maths Tutor', 'Test Cases Generator', 'Finance Analyst', 'Cybersecure Specialist'];
const musicTools: MusicTool[] = ['ElevenLabs', 'Suno'];
const languages = [
  { code: 'EN', name: 'English' },
  { code: 'HI', name: 'Hindi' },
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'DE', name: 'German' },
  { code: 'JA', name: 'Japanese' },
];

export default function PersonalisedPanel() {
  const { settings, updateSettings } = useStore();

  const toggleLanguage = (langCode: string) => {
    const newLanguages = settings.languages.includes(langCode)
      ? settings.languages.filter(l => l !== langCode)
      : [...settings.languages, langCode];
    updateSettings({ languages: newLanguages });
  };

  return (
    <Collapsible 
      open={settings.personalisedPanelOpen} 
      onOpenChange={(open) => updateSettings({ personalisedPanelOpen: open })}
      className="w-full max-w-4xl mx-auto"
    >
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-200">
          <span className="font-medium">Personalized Settings</span>
          {settings.personalisedPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-8">
          
          {/* Quick Settings Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Web Search Toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Search size={16} className="text-blue-400" />
              <span className="text-white text-sm font-medium">Web Search</span>
              <Switch
                checked={settings.webSearch}
                onCheckedChange={(checked) => updateSettings({ webSearch: checked })}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Voice Toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Mic size={16} className="text-green-400" />
              <span className="text-white text-sm font-medium">Voice</span>
              <Switch
                checked={settings.voice}
                onCheckedChange={(checked) => updateSettings({ voice: checked })}
                className="data-[state=checked]:bg-green-500"
              />
            </div>

            {/* Game Mode Toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Gamepad2 size={16} className="text-purple-400" />
              <span className="text-white text-sm font-medium">Game Mode</span>
              <Switch
                checked={settings.gameMode}
                onCheckedChange={(checked) => updateSettings({ gameMode: checked })}
                className="data-[state=checked]:bg-purple-500"
              />
            </div>
          </div>

          {/* Personas */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-blue-400" />
              <h3 className="text-white font-semibold text-lg">Choose Your Persona</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {personas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => updateSettings({ persona: settings.persona === persona ? undefined : persona })}
                  className={`p-4 rounded-2xl border transition-all duration-200 text-sm font-medium ${
                    settings.persona === persona
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          {/* Music Mode */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Music size={18} className="text-green-400" />
              <h3 className="text-white font-semibold text-lg">Music Mode</h3>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                beta
              </span>
            </div>
            <div className="flex gap-3">
              {musicTools.map((tool) => (
                <button
                  key={tool}
                  onClick={() => updateSettings({ music: settings.music === tool ? undefined : tool })}
                  className={`px-6 py-3 rounded-2xl border transition-all duration-200 font-medium ${
                    settings.music === tool
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Output Languages */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-purple-400" />
              <h3 className="text-white font-semibold text-lg">Output Languages</h3>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[200px]">
                <Select
                  value={settings.languages[0] || 'EN'}
                  onValueChange={(value) => {
                    const newLanguages = [value, ...settings.languages.filter(l => l !== value)];
                    updateSettings({ languages: newLanguages });
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue placeholder="Primary Language" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-white">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="hover:bg-white/10">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Additional language buttons */}
              <div className="flex flex-wrap gap-2">
                {languages
                  .filter(lang => !settings.languages.includes(lang.code))
                  .slice(0, 3)
                  .map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                  >
                    + {lang.code}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected additional languages */}
            {settings.languages.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {settings.languages.slice(1).map((code) => (
                  <button
                    key={code} 
                    onClick={() => toggleLanguage(code)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm hover:bg-blue-500/30 transition-all duration-200"
                  >
                    {languages.find(l => l.code === code)?.name} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}