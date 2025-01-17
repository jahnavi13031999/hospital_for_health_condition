import { Brain, Database, ChartBar, Network, Cpu } from 'lucide-react';

export const LoadingState = () => {
  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        {/* Neural Network Animation */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 animate-pulse opacity-75">
            <Network className="h-16 w-16 text-primary" />
          </div>
          <Network className="h-16 w-16 text-primary relative animate-bounce" />
        </div>

        {/* Loading Title */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            AI Processing in Progress
          </h3>
          <p className="text-gray-600">
            Our advanced ML models are analyzing hospital data to find your best matches
          </p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 bg-white/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
          <div className="flex items-center gap-3 animate-fade-in">
            <Brain className="h-5 w-5 text-purple-500 animate-pulse" />
            <span className="text-gray-700">Analyzing healthcare patterns...</span>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in [animation-delay:400ms]">
            <Database className="h-5 w-5 text-blue-500 animate-pulse" />
            <span className="text-gray-700">Processing medical data...</span>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in [animation-delay:800ms]">
            <ChartBar className="h-5 w-5 text-green-500 animate-pulse" />
            <span className="text-gray-700">Calculating hospital rankings...</span>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in [animation-delay:1200ms]">
            <Cpu className="h-5 w-5 text-indigo-500 animate-pulse" />
            <span className="text-gray-700">Optimizing recommendations...</span>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[gradient_2s_ease-in-out_infinite]" />
        </div>

        <p className="text-center text-sm text-gray-500">
          This may take a few moments while we find the best matches for you
        </p>
      </div>
    </div>
  );
};