import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Search, ShoppingCart, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BrowsePageProps {
  onNavigate: (page: string) => void;
}

interface Harvest {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  harvest_date: string | null;
  user_id: string;
  profiles: {
    full_name: string;
    location: string | null;
  };
}

export const BrowsePage = ({ onNavigate }: BrowsePageProps) => {
  const { user, profile } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [filteredHarvests, setFilteredHarvests] = useState<Harvest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    loadHarvests();
  }, []);

  useEffect(() => {
    filterHarvests();
  }, [searchTerm, categoryFilter, harvests]);

  const loadHarvests = async () => {
    try {
      const { data } = await supabase
        .from('harvests')
        .select('*, profiles(full_name, location)')
        .eq('status', 'available')
        .gt('quantity_available', 0)
        .order('created_at', { ascending: false });

      setHarvests(data || []);
      setFilteredHarvests(data || []);
    } catch (error) {
      console.error('Error loading harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHarvests = () => {
    let filtered = harvests;

    if (searchTerm) {
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((h) => h.category === categoryFilter);
    }

    setFilteredHarvests(filtered);
  };

  const handlePurchase = async () => {
    if (!user || !profile || !selectedHarvest) return;

    const purchaseQuantity = parseFloat(quantity);
    if (purchaseQuantity <= 0 || purchaseQuantity > selectedHarvest.quantity_available) {
      alert('Invalid quantity');
      return;
    }

    try {
      const totalPrice = purchaseQuantity * selectedHarvest.price;

      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', selectedHarvest.user_id)
        .single();

      await supabase.from('transactions').insert({
        harvest_id: selectedHarvest.id,
        buyer_id: profile.id,
        seller_id: sellerProfile?.id,
        quantity: purchaseQuantity,
        total_price: totalPrice,
        status: 'pending',
      });

      const newQuantity = selectedHarvest.quantity_available - purchaseQuantity;
      await supabase
        .from('harvests')
        .update({
          quantity_available: newQuantity,
          status: newQuantity === 0 ? 'sold_out' : 'available',
        })
        .eq('id', selectedHarvest.id);

      alert('Purchase request submitted successfully!');
      setSelectedHarvest(null);
      setQuantity('1');
      loadHarvests();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to complete purchase');
    }
  };

  const handleMessageSeller = async (harvest: Harvest) => {
    if (!user || !profile) {
      onNavigate('login');
      return;
    }

    onNavigate('messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading harvests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Harvests</h1>
          <p className="text-gray-600">
            Discover fresh, locally-grown produce from your community
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search harvests, farmers, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="herbs">Herbs</option>
              <option value="grains">Grains</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {filteredHarvests.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 text-lg">
              No harvests found. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHarvests.map((harvest) => (
              <Card key={harvest.id} className="overflow-hidden flex flex-col">
                {harvest.image_url ? (
                  <img
                    src={harvest.image_url}
                    alt={harvest.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <span className="text-4xl">🌱</span>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {harvest.title}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {harvest.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {harvest.description}
                    </p>
                    <div className="text-sm text-gray-600 mb-3">
                      <p className="font-medium">{harvest.profiles.full_name}</p>
                      {harvest.profiles.location && (
                        <p className="text-xs">{harvest.profiles.location}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-green-600">
                        ${harvest.price.toFixed(2)}/{harvest.unit}
                      </span>
                      <span className="text-sm text-gray-600">
                        {harvest.quantity_available} {harvest.unit} left
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user && profile?.user_type === 'buyer' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedHarvest(harvest)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Buy
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMessageSeller(harvest)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedHarvest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Purchase {selectedHarvest.title}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Price: ${selectedHarvest.price.toFixed(2)}/{selectedHarvest.unit}
                </p>
                <p className="text-gray-600 mb-2">
                  Available: {selectedHarvest.quantity_available} {selectedHarvest.unit}
                </p>
              </div>
              <Input
                type="number"
                label="Quantity"
                step="0.01"
                min="0.01"
                max={selectedHarvest.quantity_available}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">
                  Total: $
                  {(parseFloat(quantity || '0') * selectedHarvest.price).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePurchase} className="flex-1">
                  Confirm Purchase
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedHarvest(null);
                    setQuantity('1');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
