import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !date) return;
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative bg-cover bg-center h-[70vh]" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <span className="text-pink-500">DISCOVER TRAVEL BUDDIES,</span> <span className="text-orange-500">CREATE TIMELESS MEMORIES</span>
          </h1>
          <p className="text-xl text-white mb-8">
            Connect with like-minded travelers, plan trips together, and turn every journey into an unforgettable adventure
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="From where?"
                aria-label="From location"

                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-1/3">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Where to?"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-1/3">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            
            <button
  type="submit"
  disabled={!from || !to || !date}
  className={`w-full md:w-auto px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center 
    ${from && to && date ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
  <Search className="mr-2" size={20} />
  Search
</button>

          </form>
        </div>
      </div>

      {/* Featured Trips Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Destinations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Trip Card 1 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Bali, Indonesia" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bali, Indonesia</h3>
              <p className="text-gray-600 mb-4">Experience the perfect blend of beaches, culture, and adventure in this tropical paradise.</p>
              <button 
                onClick={() => navigate('/search?to=Bali')}
                className="text-indigo-600 font-medium hover:text-indigo-800"
              >
                Find trips →
              </button>
            </div>
          </div>
          
          {/* Trip Card 2 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1420&q=80" 
              alt="Paris, France" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Paris, France</h3>
              <p className="text-gray-600 mb-4">Discover the city of love with its iconic landmarks, world-class cuisine, and charming streets.</p>
              <button 
                onClick={() => navigate('/search?to=Paris')}
                className="text-indigo-600 font-medium hover:text-indigo-800"
              >
                Find trips →
              </button>
            </div>
          </div>
          
          {/* Trip Card 3 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img 
              src="https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Tokyo, Japan" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tokyo, Japan</h3>
              <p className="text-gray-600 mb-4">Immerse yourself in the perfect blend of traditional culture and futuristic technology.</p>
              <button 
                onClick={() => navigate('/search?to=Tokyo')}
                className="text-indigo-600 font-medium hover:text-indigo-800"
              >
                Find trips →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Travel Buddies</h3>
              <p className="text-gray-600">Search for trips created by other travelers or create your own to find companions.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Plan Together</h3>
              <p className="text-gray-600">Connect with like-minded travelers and plan your perfect trip together.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Explore Together</h3>
              <p className="text-gray-600">Embark on your journey with new friends and create unforgettable memories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;