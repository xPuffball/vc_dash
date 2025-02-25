import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area, Line
} from 'recharts';

// Regional data for analysis
const regionData = {
  data: [
    {
      "Region": "Alberta",
      "Software & Cloud": 12069670.0,
      "Finance & Payments": 31599790.0,
      "Robotics & Advanced Tech": 12508130.0,
      "AI & Big Data": 4769894.0,
      "Health & Biotech": 3274709.0
    },
    {
      "Region": "British Columbia",
      "Software & Cloud": 29319550.0,
      "Finance & Payments": 46082940.0,
      "Robotics & Advanced Tech": 13984610.0,
      "AI & Big Data": 11632960.0,
      "Health & Biotech": 20905960.0
    },
    {
      "Region": "Ottawa",
      "Software & Cloud": 20628000.0,
      "Finance & Payments": 23873490.0,
      "Robotics & Advanced Tech": 13085710.0,
      "AI & Big Data": 20919360.0,
      "Health & Biotech": 2380842.0
    },
    {
      "Region": "Quebec",
      "Software & Cloud": 10854740.0,
      "Finance & Payments": 14729420.0,
      "Robotics & Advanced Tech": 16598490.0,
      "AI & Big Data": 10291920.0,
      "Health & Biotech": 16655270.0
    },
    {
      "Region": "Toronto",
      "Software & Cloud": 18054230.0,
      "Finance & Payments": 22665870.0,
      "Robotics & Advanced Tech": 9527082.0,
      "AI & Big Data": 31237190.0,
      "Health & Biotech": 11288200.0
    },
    {
      "Region": "Waterloo",
      "Software & Cloud": 17356940.0,
      "Finance & Payments": 3769709.0,
      "Robotics & Advanced Tech": 59804180.0,
      "AI & Big Data": 20045230.0,
      "Health & Biotech": 5053557.0
    }
  ]
};

// Deal size data over years
const investmentAmountDollarByCategory = [
  {
    "year": 2019,
    "<$100K": 1792785,
    "$100K-$1M": 41597186,
    "$1M-$5M": 359955620,
    "$5M-$100M": 2860894121,
    "$100M+": 1714722950
  },
  {
    "year": 2020,
    "<$100K": 1099590,
    "$100K-$1M": 42345244,
    "$1M-$5M": 339050952,
    "$5M-$100M": 2805094050,
    "$100M+": 1167025000
  },
  {
    "year": 2021,
    "<$100K": 1052465,
    "$100K-$1M": 40534414,
    "$1M-$5M": 483156590,
    "$5M-$100M": 5012902902,
    "$100M+": 8488407025
  },
  {
    "year": 2022,
    "<$100K": 27,
    "$100K-$1M": 22295297,
    "$1M-$5M": 349999264,
    "$5M-$100M": 4516023653,
    "$100M+": 4860974200
  },
  {
    "year": 2023,
    "<$100K": 0,
    "$100K-$1M": 2426192,
    "$1M-$5M": 189879364,
    "$5M-$100M": 3155998116,
    "$100M+": 2394442600
  },
  {
    "year": 2024,
    "<$100K": 70,
    "$100K-$1M": 2390000,
    "$1M-$5M": 217820894,
    "$5M-$100M": 2588088062,
    "$100M+": 6273374250
  }
];

// Colors for consistent visualizations
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const DEAL_SIZE_COLORS = ['#3F0CAC', '#094D92', '#22AED1', '#42E6A4', '#F4EC15'];

// Process data for visualizations
const sectors = ["Software & Cloud", "Finance & Payments", "Robotics & Advanced Tech", "AI & Big Data", "Health & Biotech"];

// Data for Average Deal Size by Region (like Image 1)
const barChartDataInMillions = regionData.data.map(region => {
  const newObj = { region: region.Region };
  sectors.forEach(sector => {
    newObj[sector] = Math.round(region[sector] / 1000000 * 100) / 100; // Convert to millions with 2 decimal places
  });
  return newObj;
});

// Data for Tech Investment by Deal Size (like Image 2)
const dealSizeCategories = ["<$100K", "$100K-$1M", "$1M-$5M", "$5M-$100M", "$100M+"];
const stackedBarData = investmentAmountDollarByCategory.map(item => ({
  year: item.year.toString(),
  "<$100K": item["<$100K"] / 1000000000, // Convert to billions
  "$100K-$1M": item["$100K-$1M"] / 1000000000,
  "$1M-$5M": item["$1M-$5M"] / 1000000000,
  "$5M-$100M": item["$5M-$100M"] / 1000000000,
  "$100M+": item["$100M+"] / 1000000000,
}));

// Calculate total investment by region
const totalByRegion = regionData.data.map(region => {
  const total = Object.entries(region)
    .filter(([key]) => key !== "Region")
    .reduce((sum, [_, value]) => sum + value, 0);
    
  return {
    region: region.Region,
    total: Math.round(total / 1000000 * 10) / 10 // Convert to millions with 1 decimal
  };
});

// Radar chart data - comparing regions across sectors
const radarChartData = sectors.map(sector => {
  const dataPoint = { sector };
  
  regionData.data.forEach(region => {
    // Normalize the values to be between 0-100 for radar chart
    const maxValue = Math.max(...regionData.data.map(r => r[sector]));
    dataPoint[region.Region] = Math.round((region[sector] / maxValue) * 100);
  });
  
  return dataPoint;
});

// Top region by sector data
const topRegionBySector = sectors.map(sector => {
  let maxRegion = null;
  let maxAmount = 0;
  
  regionData.data.forEach(region => {
    if (region[sector] > maxAmount) {
      maxAmount = region[sector];
      maxRegion = region.Region;
    }
  });
  
  return {
    sector: sector,
    region: maxRegion,
    amount: Math.round(maxAmount / 1000000 * 10) / 10 // In millions
  };
});

// Create the Dashboard items for the Regional Analysis page
export const createRegionalDashboardItems = () => {
  return [
    // 1. Average Deal Size by Region (Similar to Image 1)
    {
      id: 101,
      type: 'regionalBarChart',
      data: barChartDataInMillions,
      title: 'Average Deal Size by Region for Top 5 Sectors (Millions $)',
      position: { x: 50, y: 100 },
      relatedInsights: [
        {
          text: `Waterloo leads in Robotics & Advanced Tech with $59.8M average investment`,
          question: "What factors drive Waterloo's leadership in Robotics & Advanced Tech?"
        },
        {
          text: `British Columbia has the highest Finance & Payments investment at $46.1M`,
          question: "Why is British Columbia a hub for Finance & Payments investment?"
        }
      ]
    },
    
    // 2. Tech Investment by Deal Size (Similar to Image 2)
    {
      id: 102,
      type: 'dealSizeChart',
      data: stackedBarData,
      title: 'Tech Investment Amount in Canada by Deal Size (2019-2024)',
      position: { x: 650, y: 100 },
      relatedInsights: [
        {
          text: `Mega deals ($100M+) peaked in 2021 at $8.5B, comprising 60.5% of total investment`,
          question: "What caused the surge in mega deals during 2021?"
        },
        {
          text: `Mid-size deals ($5M-$100M) have remained consistently important across all years`,
          question: "Why are mid-size deals more stable than other categories?"
        }
      ]
    },
    
    // 3. Total Investment by Region
    {
      id: 103,
      type: 'totalByRegion',
      data: totalByRegion,
      title: 'Total Tech Investment by Region (Millions $)',
      position: { x: 50, y: 450 },
      relatedInsights: [
        {
          text: `British Columbia leads with $121.9M in total tech investment`,
          question: "What makes British Columbia attractive for tech investment?"
        },
        {
          text: `Waterloo shows strong investment despite its smaller size`,
          question: "How has Waterloo positioned itself as a tech hub?"
        }
      ]
    },
    
    // 4. Regional Sector Specialization (Radar Chart)
    {
      id: 104,
      type: 'regionRadar',
      data: radarChartData,
      title: 'Regional Specialization Across Sectors (Relative Strength)',
      position: { x: 650, y: 450 },
      relatedInsights: [
        {
          text: `Each region shows distinct specialization patterns across sectors`,
          question: "How do regional specializations affect startup ecosystems?"
        },
        {
          text: `Toronto dominates in AI & Big Data investment`,
          question: "What factors make Toronto attractive for AI companies?"
        }
      ]
    },
    
    // 5. Top Regions by Sector
    {
      id: 105,
      type: 'topRegions',
      data: topRegionBySector,
      title: 'Leading Regions by Tech Sector (Millions $)',
      position: { x: 350, y: 800 },
      relatedInsights: [
        {
          text: `British Columbia leads in 3 of 5 top tech sectors`,
          question: "What makes British Columbia a diverse tech investment hub?"
        },
        {
          text: `Regional specialization shows distinct patterns across Canada`,
          question: "How does regional policy affect tech investment focus?"
        }
      ]
    }
  ];
};

// Custom visualization components for the Regional Dashboard

// 1. Regional Bar Chart (Similar to Image 1)
export const RegionalBarChart = ({ data, title }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="region" angle={-45} textAnchor="end" interval={0} height={70} />
        <YAxis label={{ value: 'Millions $', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `$${value}M`} />
        <Legend layout="horizontal" verticalAlign="top" align="center" />
        {sectors.map((sector, index) => (
          <Bar key={sector} dataKey={sector} fill={COLORS[index % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// 2. Deal Size Chart (Similar to Image 2)
export const DealSizeChart = ({ data, title }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: 'Billions $', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}B`} />
        <Legend layout="horizontal" verticalAlign="top" align="center" />
        {dealSizeCategories.map((category, index) => (
          <Bar 
            key={category} 
            dataKey={category} 
            stackId="a" 
            fill={DEAL_SIZE_COLORS[index % DEAL_SIZE_COLORS.length]} 
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// 3. Total Investment by Region
export const TotalByRegionChart = ({ data, title }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="region" />
        <YAxis label={{ value: 'Millions $', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `$${value}M`} />
        <Bar dataKey="total" fill="#0088FE">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// 4. Regional Radar Chart
export const RegionRadarChart = ({ data, title }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="sector" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        {regionData.data.map((region, index) => (
          <Radar 
            key={region.Region}
            name={region.Region} 
            dataKey={region.Region} 
            stroke={COLORS[index % COLORS.length]} 
            fill={COLORS[index % COLORS.length]} 
            fillOpacity={0.2} 
          />
        ))}
        <Legend />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// 5. Top Regions by Sector
export const TopRegionsChart = ({ data, title }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: 'Millions $', position: 'insideBottom', offset: -5 }} />
        <YAxis 
          type="category" 
          dataKey="sector" 
          width={140}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          formatter={(value, name, props) => [`$${value}M`, props.payload.region]}
          labelFormatter={(value) => `${value}`}
        />
        <Legend />
        <Bar dataKey="amount" fill="#8884d8" name="Investment Amount">
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// Export visualization components for use in the dashboard
export const regionalVisualizations = {
  regionalBarChart: RegionalBarChart,
  dealSizeChart: DealSizeChart,
  totalByRegion: TotalByRegionChart,
  regionRadar: RegionRadarChart,
  topRegions: TopRegionsChart
};