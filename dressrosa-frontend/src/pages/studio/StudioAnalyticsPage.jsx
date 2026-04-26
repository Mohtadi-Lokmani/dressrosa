import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Eye, 
  ShoppingBag, DollarSign, Calendar, ChevronDown 
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { formatPrice } from '../../utils/formatters';

const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${
          isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-xl">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-gray-900">
          {prefix}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StudioAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getOverview(timeRange);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Calculating Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Understand your Atelier's growth and performance</p>
          </div>
          
          <div className="flex items-center bg-white rounded-xl border border-gray-100 shadow-sm p-1">
            {[
              { label: '7D', val: 7 },
              { label: '30D', val: 30 },
              { label: '90D', val: 90 },
            ].map((r) => (
              <button
                key={r.val}
                onClick={() => setTimeRange(r.val)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  timeRange === r.val ? 'bg-burgundy text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="Total Revenue" 
            value={formatPrice(data?.totalRevenue || 0)} 
            change={12} 
            icon={DollarSign} 
            color="text-green-600" 
          />
          <MetricCard 
            title="Total Orders" 
            value={data?.totalOrders || 0} 
            change={8} 
            icon={ShoppingBag} 
            color="text-blue-600" 
          />
          <MetricCard 
            title="Product Views" 
            value={data?.totalProductViews || 0} 
            change={-5} 
            icon={Eye} 
            color="text-purple-600" 
          />
          <MetricCard 
            title="New Followers" 
            value={data?.totalFollowers || 0} 
            change={24} 
            icon={Users} 
            color="text-orange-600" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Revenue Over Time</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyRevenue || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#800020" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#800020" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F7" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                  />
                  <Tooltip content={<CustomTooltip prefix="DZD " />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#800020" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Views Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Traffic (Product Views)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.dailyViews || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F5F7" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#800020" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Info Banner */}
        <div className="bg-burgundy rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-black mb-2">Want to grow faster?</h2>
            <p className="text-burgundy-light text-sm opacity-90 mb-6">
              Boosted products get up to 3x more views and appear at the top of the Market feed. 
              Start your first campaign today and see the results in your analytics.
            </p>
            <button className="bg-white text-burgundy font-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all shadow-sm">
              Boost Your Products
            </button>
          </div>
          {/* Abstract SVG Shapes for premium feel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full mr-20 -mb-20 blur-2xl"></div>
        </div>

      </div>
    </div>
  );
};

export default StudioAnalyticsPage;
