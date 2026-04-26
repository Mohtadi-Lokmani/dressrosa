import { Rocket, Construction, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudioComingSoon = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8 inline-block">
          <div className="w-24 h-24 bg-burgundy/10 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
            <Rocket className="w-12 h-12 text-burgundy" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white border-4 border-[#F4F5F7] animate-bounce">
            <Construction className="w-4 h-4" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-3">{title || 'Coming Soon'}</h1>
        <p className="text-gray-500 font-medium mb-8">
          {description || "We're currently perfecting this tool to give your Atelier the edge it deserves. Stay tuned!"}
        </p>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 text-left">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Next Release Includes:</h4>
          <ul className="space-y-3">
            {[
              "Real-time review management",
              "Verified customer badges",
              "Public response tools"
            ].map((feature, i) => (
              <li key={i} className="flex items-center space-x-3 text-sm font-bold text-gray-700">
                <div className="w-1.5 h-1.5 bg-burgundy rounded-full"></div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => navigate('/studio')}
          className="flex items-center space-x-2 text-burgundy font-black text-xs uppercase tracking-widest mx-auto hover:translate-x-[-4px] transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Studio Home</span>
        </button>
      </div>
    </div>
  );
};

export default StudioComingSoon;
