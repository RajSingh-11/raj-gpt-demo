import { Sparkles, Brain, Palette, Zap } from 'lucide-react';

export default function QuickPrompts() {
  return (
    <div className="text-center mb-12">
      {/* Hero Avatar */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8 flex items-center justify-center shadow-2xl">
        <span className="text-3xl font-bold text-white">R</span>
      </div>
      
      {/* Title */}
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Hello, I'm RAJGPT
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
        Your personal AI assistant with Marvel-inspired themes and advanced capabilities. 
        Start a conversation and experience intelligent assistance.
      </p>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Brain className="text-white" size={24} />
          </div>
          <h3 className="text-white font-semibold mb-2 text-lg">Smart Conversations</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Engage in intelligent discussions with context-aware responses
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Palette className="text-white" size={24} />
          </div>
          <h3 className="text-white font-semibold mb-2 text-lg">Marvel Themes</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Choose from Iron Man, Hulk, Captain America and more themes
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="text-white" size={24} />
          </div>
          <h3 className="text-white font-semibold mb-2 text-lg">Advanced Features</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Voice search, web search, file attachments, and more
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white" size={24} />
          </div>
          <h3 className="text-white font-semibold mb-2 text-lg">Personalized</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Customize personas, languages, and preferences to suit your needs
          </p>
        </div>
      </div>
    </div>
  );
}