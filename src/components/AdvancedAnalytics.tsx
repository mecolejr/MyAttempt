'use client';

import { useState } from 'react';
import { useGovernmentData } from '@/lib/hooks/useGovernmentData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AdvancedAnalyticsProps {
  city: string;
  state: string;
}

export default function AdvancedAnalytics({ city, state }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, loading, error } = useGovernmentData(city, state, 'comprehensive');

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-6 h-32"></div>
            ))}
          </div>
          <div className="bg-gray-100 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'crime', label: 'Crime' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'housing', label: 'Housing' },
    { id: 'health', label: 'Health' },
    { id: 'sustainability', label: 'Sustainability' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Analytics for {city}, {state}
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab data={data} />}
      {activeTab === 'crime' && <CrimeTab data={data} />}
      {activeTab === 'demographics' && <DemographicsTab data={data} />}
      {activeTab === 'housing' && <HousingTab data={data} />}
      {activeTab === 'health' && <HealthTab data={data} />}
      {activeTab === 'sustainability' && <SustainabilityTab data={data} />}

      {/* Sources */}
      {data?.citations && data.citations.length > 0 && (
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources</h3>
          <div className="flex flex-wrap gap-3">
            {data.citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              >
                {citation.source}
                <span className="ml-1 text-xs text-blue-600">
                  ({new Date(citation.timestamp).toLocaleDateString()})
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ data }: { data: any }) {
  const tiles = [
    {
      title: 'Safety Score',
      value: data?.crime?.safetyScore || 'N/A',
      unit: data?.crime?.safetyScore ? '/100' : '',
      color: 'bg-green-500',
      description: 'Lower crime rates indicate safer communities'
    },
    {
      title: 'Population',
      value: data?.census?.population?.toLocaleString() || 'N/A',
      unit: '',
      color: 'bg-blue-500',
      description: 'Total residents in the area'
    },
    {
      title: 'Median Rent',
      value: data?.census?.medianRent ? `$${data.census.medianRent.toLocaleString()}` : 'N/A',
      unit: '/month',
      color: 'bg-purple-500',
      description: 'Monthly housing costs'
    },
    {
      title: 'Health Score',
      value: data?.health?.healthScore ? Math.round(data.health.healthScore) : 'N/A',
      unit: data?.health?.healthScore ? '/100' : '',
      color: 'bg-red-500',
      description: 'Community health indicators'
    },
    {
      title: 'Sustainability',
      value: data?.sustainability?.sustainabilityScore ? Math.round(data.sustainability.sustainabilityScore) : 'N/A',
      unit: data?.sustainability?.sustainabilityScore ? '/100' : '',
      color: 'bg-green-600',
      description: 'Air quality and green space'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tiles.map((tile, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`${tile.color} rounded-lg p-3 text-white mr-4`}>
              <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{tile.title}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {tile.value}
                <span className="text-sm font-normal text-gray-500 ml-1">{tile.unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{tile.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CrimeTab({ data }: { data: any }) {
  const crimeData = [
    { name: 'Violent Crime', value: data?.crime?.violentCrime || 0 },
    { name: 'Property Crime', value: data?.crime?.propertyCrime || 0 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Crime Statistics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={crimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Safety Score</span>
              <span className="text-sm text-gray-500">{data?.crime?.safetyScore || 0}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${data?.crime?.safetyScore || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemographicsTab({ data }: { data: any }) {
  if (!data?.census?.raceBreakdown) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No demographic data available</p>
      </div>
    );
  }

  const raceData = Object.entries(data.census.raceBreakdown).map(([race, info]: [string, any]) => ({
    name: race.charAt(0).toUpperCase() + race.slice(1),
    value: info.percent,
    count: info.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Racial Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={raceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent || 0).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {raceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any, name) => [
              `${(value || 0).toFixed(1)}%`,
              name
            ]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Diversity Metrics</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Diversity Index</span>
              <span className="text-sm text-gray-500">
                {data?.census?.diversityIndex ? (data.census.diversityIndex * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(data?.census?.diversityIndex || 0) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Higher values indicate greater racial diversity
            </p>
          </div>
          
          <div className="space-y-3">
            {raceData.map((group, index) => (
              <div key={group.name} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{group.name}</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {group.count?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(group.value || 0).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HousingTab({ data }: { data: any }) {
  const housingMetrics = [
    {
      label: 'Median Rent',
      value: data?.census?.medianRent ? `$${data.census.medianRent.toLocaleString()}` : 'N/A',
      description: 'Monthly rental costs'
    },
    {
      label: 'Median Home Value',
      value: data?.census?.medianHomeValue ? `$${data.census.medianHomeValue.toLocaleString()}` : 'N/A',
      description: 'Property values'
    },
    {
      label: 'Homeownership Rate',
      value: data?.census?.homeownershipRate ? `${(data.census.homeownershipRate * 100).toFixed(1)}%` : 'N/A',
      description: 'Residents who own homes'
    },
    {
      label: 'Vacancy Rate',
      value: data?.census?.vacancyRate ? `${(data.census.vacancyRate * 100).toFixed(1)}%` : 'N/A',
      description: 'Empty housing units'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {housingMetrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{metric.label}</h3>
          <p className="text-3xl font-bold text-blue-600 mb-1">{metric.value}</p>
          <p className="text-sm text-gray-500">{metric.description}</p>
        </div>
      ))}
    </div>
  );
}

function HealthTab({ data }: { data: any }) {
  const healthIndicators = [
    { name: 'Obesity', value: data?.health?.obesity || 0, color: '#ef4444' },
    { name: 'Diabetes', value: data?.health?.diabetes || 0, color: '#f97316' },
    { name: 'Smoking', value: data?.health?.smoking || 0, color: '#eab308' },
    { name: 'Mental Distress', value: data?.health?.mentalDistress || 0, color: '#06b6d4' },
    { name: 'Uninsured', value: data?.health?.uninsured || 0, color: '#8b5cf6' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Indicators (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={healthIndicators}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Health Score</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {data?.health?.healthScore ? Math.round(data.health.healthScore) : 'N/A'}
            {data?.health?.healthScore && <span className="text-lg text-gray-500">/100</span>}
          </div>
          <p className="text-sm text-gray-500">
            Higher scores indicate better community health outcomes
          </p>
        </div>
      </div>
    </div>
  );
}

function SustainabilityTab({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Air Quality</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">PM2.5</span>
            <p className="text-xl font-bold text-blue-600">
              {data?.sustainability?.airQuality?.pm25?.toFixed(1) || 'N/A'} μg/m³
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">PM10</span>
            <p className="text-xl font-bold text-blue-600">
              {data?.sustainability?.airQuality?.pm10?.toFixed(1) || 'N/A'} μg/m³
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Ozone</span>
            <p className="text-xl font-bold text-blue-600">
              {data?.sustainability?.airQuality?.ozone?.toFixed(3) || 'N/A'} ppm
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Green Space</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Parks</span>
            <p className="text-xl font-bold text-green-600">
              {data?.sustainability?.greenspace?.parkCount || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Park Density</span>
            <p className="text-xl font-bold text-green-600">
              {data?.sustainability?.greenspace?.parkDensity?.toFixed(1) || 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sustainability Score</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {data?.sustainability?.sustainabilityScore ? Math.round(data.sustainability.sustainabilityScore) : 'N/A'}
            {data?.sustainability?.sustainabilityScore && <span className="text-lg text-gray-500">/100</span>}
          </div>
          <p className="text-sm text-gray-500">
            Combines air quality and green space metrics
          </p>
        </div>
      </div>
    </div>
  );
}