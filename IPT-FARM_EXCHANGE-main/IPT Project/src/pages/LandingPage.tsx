import { Sprout, Users, ShoppingBag, MessageCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-20 px-4" id="home">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Connect with Your Local{' '}
            <span className="text-green-600">Farmers & Gardeners</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            FarmExchange brings fresh, locally-grown produce directly from your community's
            farmers and gardeners to your table. Support local agriculture while enjoying
            the freshest harvests available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate('signup')}>
              Get Started
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('browse')}>
              Browse Harvests
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white scroll-mt-16" id="about">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose FarmExchange?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fresh & Local</h3>
              <p className="text-gray-600 leading-relaxed">
                Get access to the freshest produce from your local community. Support
                sustainable agriculture and reduce your carbon footprint.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Community First</h3>
              <p className="text-gray-600 leading-relaxed">
                Build relationships with local farmers and gardeners. Know where your food
                comes from and support your neighbors.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600 leading-relaxed">
                Browse available harvests, connect with sellers, and arrange pickups all
                through our simple platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50 scroll-mt-16" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Account</h3>
              <p className="text-gray-600">
                Sign up as a farmer to list your harvests or as a buyer to browse local
                produce.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect</h3>
              <p className="text-gray-600">
                Browse available harvests and connect with local farmers and gardeners
                through our messaging system.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Exchange</h3>
              <p className="text-gray-600">
                Complete transactions and arrange pickups. Support local agriculture and
                enjoy fresh produce.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white scroll-mt-16" id="contact">
        <div className="max-w-4xl mx-auto text-center">
          <MessageCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-xl text-gray-600 mb-8">
            Have questions? We're here to help you connect with your local food community.
          </p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-700 mb-4">
              <strong>Email:</strong> support@farmexchange.com
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> (555) 123-4567
            </p>
          </div>
        </div>
      </section>

      <section className="bg-green-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-xl mb-8 text-green-50">
            Join our community today and discover the freshest local produce.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('signup')}
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};
