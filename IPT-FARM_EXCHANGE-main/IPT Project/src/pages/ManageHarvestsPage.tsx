import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Textarea } from '../components/Input';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ManageHarvestsPageProps {
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
  status: string;
  harvest_date: string | null;
}

export const ManageHarvestsPage = ({ onNavigate }: ManageHarvestsPageProps) => {
  const { profile } = useAuth();
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    quantity_available: '',
    image_url: '',
    harvest_date: '',
  });

  useEffect(() => {
    loadHarvests();
  }, [profile]);

  const loadHarvests = async () => {
    if (!profile) return;

    try {
      const { data } = await supabase
        .from('harvests')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      setHarvests(data || []);
    } catch (error) {
      console.error('Error loading harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    const harvestData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      unit: formData.unit,
      quantity_available: parseFloat(formData.quantity_available),
      image_url: formData.image_url || null,
      harvest_date: formData.harvest_date || null,
      user_id: profile.id,
      status: 'available',
    };

    try {
      if (editingId) {
        await supabase.from('harvests').update(harvestData).eq('id', editingId);
      } else {
        await supabase.from('harvests').insert(harvestData);
      }

      await loadHarvests();
      resetForm();
    } catch (error) {
      console.error('Error saving harvest:', error);
    }
  };

  const handleEdit = (harvest: Harvest) => {
    setFormData({
      title: harvest.title,
      description: harvest.description,
      category: harvest.category,
      price: harvest.price.toString(),
      unit: harvest.unit,
      quantity_available: harvest.quantity_available.toString(),
      image_url: harvest.image_url || '',
      harvest_date: harvest.harvest_date || '',
    });
    setEditingId(harvest.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this harvest?')) return;

    try {
      await supabase.from('harvests').delete().eq('id', id);
      setHarvests(harvests.filter((h) => h.id !== id));
    } catch (error) {
      console.error('Error deleting harvest:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      quantity_available: '',
      image_url: '',
      harvest_date: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (profile?.user_type !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            This page is only available to farmers and gardeners.
          </p>
          <Button onClick={() => onNavigate('dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading harvests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Harvests</h1>
            <p className="text-gray-600 mt-2">Create and manage your harvest listings</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Add Harvest
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Harvest' : 'Add New Harvest'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Harvest Title"
                  placeholder="e.g., Fresh Tomatoes"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="herbs">Herbs</option>
                    <option value="grains">Grains</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  type="number"
                  step="0.01"
                  label="Price per Unit"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="lb">Pound (lb)</option>
                    <option value="bunch">Bunch</option>
                    <option value="dozen">Dozen</option>
                    <option value="piece">Piece</option>
                  </select>
                </div>

                <Input
                  type="number"
                  step="0.01"
                  label="Quantity Available"
                  placeholder="0.00"
                  value={formData.quantity_available}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity_available: e.target.value })
                  }
                  required
                />

                <Input
                  type="date"
                  label="Harvest Date"
                  value={formData.harvest_date}
                  onChange={(e) =>
                    setFormData({ ...formData, harvest_date: e.target.value })
                  }
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Describe your harvest..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />

              <Input
                type="url"
                label="Image URL (Optional)"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
              />

              <div className="flex gap-3">
                <Button type="submit">
                  {editingId ? 'Update Harvest' : 'Create Harvest'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {harvests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No harvests yet. Create your first listing!</p>
            </div>
          ) : (
            harvests.map((harvest) => (
              <Card key={harvest.id} className="overflow-hidden">
                {harvest.image_url && (
                  <img
                    src={harvest.image_url}
                    alt={harvest.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {harvest.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {harvest.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      ${harvest.price}/{harvest.unit}
                    </span>
                    <span className="text-sm text-gray-600">
                      {harvest.quantity_available} {harvest.unit} available
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(harvest)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(harvest.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
