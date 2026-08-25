import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// 關鍵修復：導出名稱必須與 Results.tsx 引用的一致
export const AptitudeRadar = ({ scores }: { scores: any }) => {
  const data = {
    labels: ['Ownership', 'Integrity', 'Teamwork', 'Adaptability', 'Learning', 'Execution'],
    datasets: [{
      label: 'Score',
      data: [
        scores?.ownership || 0, 
        scores?.integrity || 0, 
        scores?.teamwork || 0, 
        scores?.adaptability || 0, 
        scores?.learning || 0, 
        scores?.execution || 0
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
    }],
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Radar data={data} options={{ maintainAspectRatio: false }} />
    </div>
  );
};

// 同時提供 default export 以防萬一
export default AptitudeRadar;
