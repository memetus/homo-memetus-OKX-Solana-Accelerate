import React, { useMemo } from 'react';
import styles from '@/components/common/graph/agentGraph/AgentGraph.module.scss';
import classNames from 'classnames/bind';
import {
  Chart,
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useQuery } from '@tanstack/react-query';
import { getAgentGraph } from '@/shared/api/agent/api';
import { Line } from 'react-chartjs-2';
import { thousandFormat } from '@/shared/utils/format';

const cx = classNames.bind(styles);

Chart.register(
  LinearScale,
  CategoryScale,
  LineElement,
  PointElement,
  Legend,
  Title,
  annotationPlugin,
  Tooltip,
);

type Props = {
  id: string;
  state: 'hour' | 'day';
};

const AgentGraph = ({ id, state }: Props) => {
  const { data } = useQuery({
    queryKey: ['agent-graph'],
    queryFn: () => {
      return getAgentGraph(id);
    },
  });

  const chartXData = useMemo(() => {
    return data?.map((item: { timestamp: string }) => {
      const month = item.timestamp.slice(5, 7);
      const day = item.timestamp.slice(8, 10);
      const hour = item.timestamp.slice(11, 13);

      return `${month}/${day}:${hour}:00`;
    });
  }, [data]);

  const value = useMemo(() => {
    const result = data?.map((item: { value: number }) => {
      return item.value.toFixed(1);
    });
    if (!result) return { scope: [0, 0], result: [] };
    const min = Math.floor(Math.min(...result));
    const max = Math.ceil(Math.max(...result));

    return {
      scope: [min, max],
      result,
    };
  }, [data, state]);

  const graph = useMemo(() => {
    return {
      labels: chartXData,
      datasets: [
        {
          label: 'MEME SURGE SLIK',
          data: value.result,
          fill: true,
          backgroundColor: '#C7BD4B',
          borderColor: '#C7BD4B',
          borderWidth: 1,
          tension: 0,
          pointStyle: 'circle',
          pointRadius: 2,
          pointHoverRadius: 4,
          showLine: true,
        },
      ],
    };
  }, [data]);

  const stackWeight = useMemo(() => {
    const range = value.scope[1] - value.scope[0];
    if (range === 0) return 0;
    else if (range < 100) return 1;
    else return range / 100;
  }, [value]);

  return (
    <div className={cx('chart-container')}>
      <Line
        itemType="line"
        className={cx('chart')}
        height={120}
        data={{ ...graph }}
        options={{
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: true,
          },
          plugins: {
            legend: {
              display: true,
              align: 'start',
              position: 'bottom',
            },
            tooltip: {
              enabled: true,
              callbacks: {
                title: (context: any) => {
                  return `Date: ${context[0].label}`;
                },
                label: (context: any) => {
                  const label = context.dataset.label || '';
                  if (label) {
                    return `${label}: $${thousandFormat(
                      context.parsed.y.toFixed(2),
                    )}`;
                  }
                },
              },
            },
          },
          scales: {
            x: {
              display: false,
              beginAtZero: false,
            },
            y: {
              stackWeight,
              min: value.scope[0],
              max: value.scope[1],
              display: true,
            },
          },
        }}
      />
    </div>
  );
};

export default AgentGraph;
