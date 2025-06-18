import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function SellerAnalyticsSection() {
  const [sold, setSold] = useState(0);
  const [unsold, setUnsold] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState({});
  const [topBids, setTopBids] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'auctions'), where('sellerId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => doc.data());

      let soldCount = 0;
      let unsoldCount = 0;
      let monthly = {};
      let bidStats = [];
      let totalSales = 0;
      let allViews = 0;

      const currentMonth = new Date().getMonth(); 
      for (let i = 3; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const label = new Date(0, monthIndex).toLocaleString('default', { month: 'short' });
        monthly[label] = 0;
      }

docs.forEach(doc => {
  const status = doc.status?.toLowerCase();

  if (status === 'sold') {
    soldCount++;
    totalSales += parseFloat(doc.currentBid) || 0;
  } else {
    unsoldCount++;
  }

  const month = new Date(doc.createdAt?.toDate?.() || Date.now()).toLocaleString('default', { month: 'short' });
  if (monthly.hasOwnProperty(month)) {
    monthly[month]++;
  }

  if (doc.totalBids) {
    bidStats.push({ title: doc.title, count: doc.totalBids });
  }

  if (doc.views) {
    allViews += doc.views;
  }
});

const totalListed = soldCount + unsoldCount;
setSold(soldCount);
setUnsold(unsoldCount);
setMonthlyStats(monthly);
setTopBids(bidStats.sort((a, b) => b.count - a.count).slice(0, 5));
setTotalRevenue(totalSales);
setAvgPrice(soldCount > 0 ? (totalSales / soldCount).toFixed(2) : 0);
setConversionRate(totalListed > 0 ? ((soldCount / totalListed) * 100).toFixed(2) : 0);
    };

    fetchData();
  }, []);

  return (
    <div className="analytics-container">
      <h2>Your Analytics</h2>

      <div className="basic-stats-row">
        <div className="stat-box">
          <h5>Total Revenue</h5>
          <p>₹{totalRevenue}</p>
        </div>
        <div className="stat-box">
          <h5>Average Selling Price</h5>
          <p>₹{avgPrice}</p>
        </div>
        <div className="stat-box">
          <h5>Conversion Rate</h5>
          <p>{conversionRate}%</p>
        </div>
      </div>

      <div className="charts-wrapper">
        <div className="chart-card">
          <h4>Sold vs Unsold</h4>
          <Doughnut
            data={{
              labels: ['Sold', 'Unsold'],
              datasets: [{
                data: [sold, unsold],
                backgroundColor: ['#4caf50', '#e57373'],
                borderWidth: 1,
              }]
            }}
          />
        </div>

        <div className="chart-card">
          <h4>Auctions Created per Month</h4>
          <Bar
            options={{
              scales: {
                x: {
                  grid: { color: '#777' },
                  ticks: { color: '#222' }
                },
                y: {
                  grid: { color: '#777' },
                  ticks: { color: '#222' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#222' }
                }
              }
            }}
            data={{
              labels: Object.keys(monthlyStats),
              datasets: [{
                label: 'Auctions',
                data: Object.values(monthlyStats),
                backgroundColor: '#6c63ff'
              }]
            }}
          />
        </div>

        <div className="chart-card">
          <h4>Top 5 Auctions by Bids</h4>
          <Bar
            options={{
              indexAxis: 'y',
              scales: {
                x: {
                  grid: { color: '#777' },
                  ticks: { color: '#222' }
                },
                y: {
                  grid: { color: '#777' },
                  ticks: { color: '#222' }
                }
              },
              plugins: {
                legend: {
                  labels: { color: '#222' }
                }
              }
            }}
            data={{
              labels: topBids.map(b => b.title),
              datasets: [{
                label: 'Bids',
                data: topBids.map(b => b.count),
                backgroundColor: '#fbbc05'
              }]
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SellerAnalyticsSection;