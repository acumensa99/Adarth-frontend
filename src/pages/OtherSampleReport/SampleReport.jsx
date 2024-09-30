import {  useEffect, useState, useCallback, useRef } from 'react';
import {  Pie } from 'react-chartjs-2';
import {
  daysInAWeek,
  financialEndDate,
  financialStartDate,
  monthsInShort,
  quarters,
  serialize
} from '../../utils';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Loader } from 'react-feather';
import classNames from 'classnames';
import {
  useBookingReportByRevenueGraph,
  useBookingRevenueByIndustry,
} from '../../apis/queries/booking.queries';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import ViewByFilter from '../../components/modules/reports/ViewByFilter';
import { DATE_FORMAT } from '../../utils/constants';
dayjs.extend(quarterOfYear);
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
  Chart,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
);
const barDataConfigByIndustry = {
  options: {
    responsive: true,
  },
  styles: {
    backgroundColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderWidth: 1,
  },
};

export const pieData = {
  labels: [],
  datasets: [
    {
      label: '',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};
const SampleReport = () => {
  const [startDate, setStartDate] = useState(financialStartDate);
  const [endDate, setEndDate] = useState(financialEndDate);
  const [groupBy, setGroupBy] = useState('month');

  const [updatedReveueGraph, setUpdatedRevenueGraph] = useState({
    id: uuidv4(),
    labels: monthsInShort,
    datasets: [
      {
        label: 'Revenue',
        data: [],
        borderColor: '#914EFB',
        backgroundColor: '#914EFB',
        cubicInterpolationMode: 'monotone',
      },
    ],
  });

  const [updatedIndustry, setUpdatedIndustry] = useState({
    id: uuidv4(),
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        ...barDataConfigByIndustry.styles,
      },
    ],
  });

  const { data: revenueGraphData, isLoading: isRevenueGraphLoading } =
    useBookingReportByRevenueGraph(
      serialize({
        startDate,
        endDate,
        groupBy,
      }),
    );

  const { data: revenueDataByIndustry, isLoading: isByIndustryLoading } =
    useBookingRevenueByIndustry(
      serialize({
        startDate,
        endDate,
      }),
    );

  const handleRevenueGraphViewBy = viewType => {
    if (viewType === 'reset' || viewType === 'year') {
      setStartDate(financialStartDate);
      setEndDate(financialEndDate);
      setGroupBy('month');
    }

    if (viewType === 'week' || viewType === 'month') {
      setStartDate(dayjs().startOf(viewType).format(DATE_FORMAT));
      setEndDate(dayjs().endOf(viewType).format(DATE_FORMAT));
      setGroupBy(viewType === 'month' ? 'dayOfMonth' : 'dayOfWeek');
    }
    if (viewType === 'quarter') {
      setStartDate(financialStartDate);
      setEndDate(financialEndDate);
      setGroupBy('quarter');
    }
  };
  const handleUpdateRevenueGraph = useCallback(() => {
    if (revenueGraphData) {
      const tempData = {
        labels: [],
        datasets: [
          {
            label: 'Revenue',
            data: [],
            borderColor: '#914EFB',
            backgroundColor: '#914EFB',
            cubicInterpolationMode: 'monotone',
          },
        ],
      };

      switch (groupBy) {
        case 'dayOfWeek':
          tempData.labels = daysInAWeek;
          tempData.datasets[0].data = Array(7).fill(0);
          break;
        case 'dayOfMonth':
          tempData.labels = Array.from({ length: dayjs().daysInMonth() }, (_, i) => i + 1);
          tempData.datasets[0].data = Array(dayjs().daysInMonth()).fill(0);
          break;
        case 'quarter':
          tempData.labels = quarters;
          tempData.datasets[0].data = Array(4).fill(0);
          break;
        default:
          tempData.labels = monthsInShort;
          tempData.datasets[0].data = Array(12).fill(0);
          break;
      }

      revenueGraphData?.forEach(item => {
        const id = Number(item._id);
        const total = Number(item.total).toFixed(2) || 0;

        if (groupBy === 'dayOfMonth' && id <= dayjs().daysInMonth()) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'dayOfWeek' && id <= 7) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'quarter' && id <= 4) {
          tempData.datasets[0].data[id - 1] = total;
        } else if (groupBy === 'month' || groupBy === 'year') {
          if (id < 4) {
            tempData.datasets[0].data[id + 8] = total;
          } else {
            tempData.datasets[0].data[id - 4] = total;
          }
        }
      });

      setUpdatedRevenueGraph(tempData);
    }
  }, [revenueGraphData, groupBy]);

  const handleUpdatedReveueByIndustry = useCallback(() => {
    const tempBarData = {
      labels: [],
      datasets: [
        {
          label: 'Revenue by Industry',
          data: [],
          ...barDataConfigByIndustry.styles,
        },
      ],
    };

    if (revenueDataByIndustry) {
      revenueDataByIndustry.forEach((item, index) => {
        tempBarData.labels.push(item._id);
        tempBarData.datasets[0].data.push(Number(item.total) || 0);
      });
      setUpdatedIndustry(tempBarData);
    }
  }, [revenueDataByIndustry]);

  useEffect(() => {
    handleUpdateRevenueGraph();
  }, [revenueGraphData, groupBy]);

  useEffect(() => {
    handleUpdatedReveueByIndustry();
  }, [revenueDataByIndustry]);


  return (
    <div className={classNames('overflow-y-auto px-5 col-span-10 overflow-x-hidden')}>
    <div className="my-6 w-[60rem]" id="revenue-pdf">
      <div className="h-[60px] border-b my-5 border-gray-450 flex ">
        <ViewByFilter handleViewBy={handleRevenueGraphViewBy} />
      </div>
      <div className="flex gap-8">
        <div className="w-[30%] flex flex-col">
          <div className="flex justify-between items-start">
            <p className="font-bold">Industry wise revenue graph</p>
          </div>
          <div className="w-80 m-auto">
            {isByIndustryLoading ? (
              <Loader className="mx-auto" />
            ) : !updatedIndustry.datasets[0].data.length ? (
              <p className="text-center">NA</p>
            ) : (
              <Pie
                data={updatedIndustry}
                options={barDataConfigByIndustry.options}
                key={updatedIndustry.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
</div>
  );
};

export default SampleReport;
