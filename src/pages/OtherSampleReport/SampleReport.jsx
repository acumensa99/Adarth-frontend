import { useEffect, useState, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import ViewByFilter from '../../components/modules/reports/ViewByFilter';
import { DATE_FORMAT } from '../../utils/constants';
import { useBookings } from '../../apis/queries/booking.queries';
import { useSearchParams } from 'react-router-dom';
import { financialEndDate, financialStartDate } from '../../utils';
import { Loader } from '@mantine/core';

dayjs.extend(quarterOfYear);

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

const SampleReport = () => {
  const [startDate, setStartDate] = useState(financialStartDate);
  const [endDate, setEndDate] = useState(financialEndDate);
  const [groupBy, setGroupBy] = useState('month');
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

  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: bookingData,
    isLoading: isLoadingBookingData,
  } = useBookings(searchParams.toString());

  const filterBookingDataByDate = useCallback(() => {
    if (!bookingData || !Array.isArray(bookingData.docs)) {
      return [];
    }
  
    const start = dayjs(startDate, DATE_FORMAT);
    const end = dayjs(endDate, DATE_FORMAT);
  
    const filteredBookings = bookingData.docs.filter((booking) => {
      const bookingDate = dayjs(booking.createdAt);
      const isWithinRange = bookingDate.isBetween(start, end, 'day', '[]');
     
      return isWithinRange;
    });

    return filteredBookings;
  }, [bookingData, startDate, endDate]);
  
  const handleUpdatedReveueByIndustry = useCallback(() => {
    const filteredData = filterBookingDataByDate();
  
    if (filteredData.length === 0) {
      setUpdatedIndustry(prevState => ({
        ...prevState,
        labels: [],
        datasets: [{ ...prevState.datasets[0], data: [] }],
      }));
      return;
    }
  
    const industryRevenueMap = filteredData.reduce((acc, booking) => {
      const industryName = booking?.campaign?.industry?.name || 'Unknown Industry';
      const totalAmount = booking?.totalAmount || 0;
  
      if (!acc[industryName]) {
        acc[industryName] = 0;
      }
      acc[industryName] += totalAmount;
  
      return acc;
    }, {});
  
   
    const tempBarData = {
      labels: Object.keys(industryRevenueMap),
      datasets: [
        {
          label: 'Revenue by Industry',
          data: Object.values(industryRevenueMap),
          ...barDataConfigByIndustry.styles,
        },
      ],
    };
  
    setUpdatedIndustry(tempBarData);
  }, [filterBookingDataByDate]);
  

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
  

  useEffect(() => {
    handleUpdatedReveueByIndustry();
  }, [handleUpdatedReveueByIndustry, startDate, endDate, groupBy]);
  

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
            {isLoadingBookingData ? (
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
