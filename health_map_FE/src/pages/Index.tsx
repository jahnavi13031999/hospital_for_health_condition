import { SearchForm } from "@/components/SearchForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">
            Find the Best Hospital for Your Needs
          </h1>
          <p className="text-gray-600 mb-8">
            Enter your location and health concern to get personalized hospital recommendations
          </p>
          <SearchForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
