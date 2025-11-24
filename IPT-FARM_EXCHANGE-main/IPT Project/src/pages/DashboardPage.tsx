import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Package, MessageSquare, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardPageProps {
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
  status: string;
  created_at: string;
}

interface Transaction {
  id: string;
  quantity: number;
  total_price: number;
  status: string;
  transaction_date: string;
  harvest_id: string;
  harvests: {
    title: string;
  };
}

export const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  const { profile } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      if (profile.user_type === 'farmer') {
        const { data: harvestData } = await supabase
          .from('harvests')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setHarvests(harvestData || []);

        const { data: salesData } = await supabase
          .from('transactions')
          .select('*, harvests(title)')
          .eq('seller_id', profile.id)
          .order('transaction_date', { ascending: false })
          .limit(5);

        setTransactions(salesData || []);
      } else {
        const { data: purchaseData } = await supabase
          .from('transactions')
          .select('*, harvests(title)')
          .eq('buyer_id', profile.id)
          .order('transaction_date', { ascending: false })
          .limit(5);

        setTransactions(purchaseData || []);
      }

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', profile.id)
        .eq('is_read', false);

      setUnreadMessages(count || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHarvest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this harvest?')) return;

    try {
      await supabase.from('harvests').delete().eq('id', id);
      setHarvests(harvests.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting harvest:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.user_type === 'farmer'
              ? 'Manage your harvests and track your sales'
              : 'Browse harvests and track your purchases'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {profile?.user_type === 'farmer' ? 'Active Listings' : 'Total Purchases'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {profile?.user_type === 'farmer' ? harvests.length : transactions.length}
                </p>
              </div>
              <Package className="h-12 w-12 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unread Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{unreadMessages}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">
                  {profile?.user_type === 'farmer' ? 'Total Sales' : 'Transactions'}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{transactions.length}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profile?.user_type === 'farmer' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Harvests</h2>
                <Button size="sm" onClick={() => onNavigate('manage-harvests')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>
              {harvests.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No harvests yet. Create your first listing!
                </p>
              ) : (
                <div className="space-y-3">
                  {harvests.map((harvest) => (
                    <div
                      key={harvest.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{harvest.title}</h3>
                        <p className="text-sm text-gray-600">
                          ${harvest.price}/{harvest.unit} • {harvest.quantity_available}{' '}
                          {harvest.unit} available
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                            harvest.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {harvest.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onNavigate('manage-harvests')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHarvest(harvest.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent {profile?.user_type === 'farmer' ? 'Sales' : 'Purchases'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('transactions')}
              >
                View All
              </Button>
            </div>
            {transactions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">
                      {transaction.harvests.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {transaction.quantity} units • ${transaction.total_price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {profile?.user_type === 'buyer' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onNavigate('browse')}
                >
                  <Package className="h-5 w-5 mr-2" />
                  Browse Harvests
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onNavigate('messages')}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  View Messages
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
