import { useMemo, useState } from 'react';
import { useBookingsNew } from '../../apis/queries/booking.queries';
import { useSearchParams } from 'react-router-dom';
import { Menu, Button, Checkbox, Group, Paper, Select, MultiSelect } from '@mantine/core';
import classNames from 'classnames';
import DateRangeSelector from '../../components/DateRangeSelector';
import { useDistinctAdditionalTags } from '../../apis/queries/inventory.queries';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Table from '../../components/Table/Table';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  LogarithmicScale,
);

const viewBy = {
  reset: '',
  past10Years: 'Past 10 Years',
  past5Years: 'Past 5 Years',
  previousYear: 'Previous Year',
  currentYear: 'Current Year',
  quarter: 'Quarterly',
  currentMonth: 'Current Month',
  past7: 'Past 7 Days',
  customDate: 'Custom Date Range',
};

const list = [
  { label: 'Past 10 Years', value: 'past10Years' },
  { label: 'Past 5 Years', value: 'past5Years' },
  { label: 'Previous Year', value: 'previousYear' },
  { label: 'Current Year', value: 'currentYear' },
  { label: 'Quarterly', value: 'quarter' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Past 7 Days', value: 'past7' },
  { label: 'Custom Date Range', value: 'customDate' },
];

const TagsWiseReport = () => {
  const [searchParams] = useSearchParams({
    page: 1,
    limit: 1000,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const {
    data: bookingData,
    isLoading: isLoadingBookingData,
    error,
  } = useBookingsNew(searchParams.toString());

  const additionalTagsQuery = useDistinctAdditionalTags();
  const [selectedTags, setSelectedTags] = useState([]);
  const [filter, setFilter] = useState('');
  const [activeView, setActiveView] = useState('');
  const [startDate1, setStartDate1] = useState(null);
  const [endDate1, setEndDate1] = useState(null);
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  const generateYearRange = (startYear, endYear) => {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const currentYear = new Date().getFullYear(); // Define currentYear at the start
  const generatePast7Days = () => {
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      past7Days.push(`${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`);
    }
    return past7Days;
  };
  const transformedData = useMemo(() => {
    if (!bookingData || !selectedTags.length) return {};
  
    const currentYear = new Date().getFullYear();
    const past7DaysRange = generatePast7Days(); // Assumes this generates an array of 'MMM DD' format
  
    const groupedData = bookingData.reduce((acc, booking) => {
      const detailsWithTags = booking.details.filter(detail => {
        const campaign = detail.campaign;
        if (!campaign || !campaign.spaces || !Array.isArray(campaign.spaces)) return false;
  
        return campaign.spaces.some(space => {
          const spaceTags = space.specifications?.additionalTags || [];
          return Array.isArray(spaceTags) && selectedTags.some(tag => spaceTags.includes(tag));
        });
      });
  
      if (detailsWithTags.length === 0) return acc;
  
      detailsWithTags.forEach(detail => {
        const date = new Date(detail.createdAt);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const formattedDay = `${month} ${day}`;
        const revenue = booking.totalAmount;
  
        selectedTags.forEach(tag => {
          const tagMatches = detail.campaign.spaces.some(space =>
            space.specifications?.additionalTags?.includes(tag)
          );
          if (!tagMatches) return;
  
          let timeUnit;
          // Filter-based time unit logic
          if (filter === 'past10Years' && year >= currentYear - 10) {
            timeUnit = year;
          } else if (filter === 'past5Years' && year >= currentYear - 5) {
            timeUnit = year;
          } else if (filter === 'previousYear' && year === currentYear - 1) {
            timeUnit = month;
          } else if (filter === 'currentYear' && year === currentYear) {
            timeUnit = month;
          } else if (filter === 'currentMonth' && date.getMonth() === new Date().getMonth() && year === currentYear) {
            timeUnit = day;
          } else if (filter === 'past7' && past7DaysRange.includes(formattedDay)) {
            timeUnit = formattedDay;
          } else if (filter === 'customDate' && date.getTime() >= new Date(startDate1).getTime() && date.getTime() <= new Date(endDate1).getTime()) {
            timeUnit = formattedDay;
          } else if (filter === 'quarter') {
            const quarterly = Math.ceil((date.getMonth() + 1) / 3);
            const quarterNames = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
            timeUnit = quarterNames[quarterly - 1];
          }
  
          if (!timeUnit) return;
  
          // Initialize objects if necessary
          if (!acc[timeUnit]) acc[timeUnit] = {};
          if (!acc[timeUnit][tag]) acc[timeUnit][tag] = 0;
  
          // Accumulate revenue
          acc[timeUnit][tag] += revenue;
        });
      });
  
      return acc;
    }, {});
  
    return groupedData;
  }, [bookingData, selectedTags, filter, startDate1, endDate1]);
  
  const chartData3 = useMemo(() => {
    const selectedData = transformedData || {};
  
    if (!selectedData || Object.keys(selectedData).length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }
  
    let labels = Object.keys(selectedData);
  
    // Ensure the quarters are sorted correctly if the 'quarter' filter is active
    if (filter === 'quarter') {
      labels = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    }
  
    // For each selected tag, create a dataset
    const datasets = selectedTags.map((tag, index) => {
      const data = labels.map(label => {
        const tagRevenue = selectedData[label]?.[tag] || 0;
        return tagRevenue > 0 ? tagRevenue / 100000 : 0; // Convert to lacs
      });
  
      const hue = ((index * 360) / selectedTags.length) % 360; // Ensure hue is within 0-360 range
      const color = `hsl(${hue}, 70%, 50%)`; // Border color
      const colorRGBA = `hsla(${hue}, 70%, 50%, 0.2)`; // Background color with transparency
  
      return {
        label: ` ${tag} `,
        data,
        borderColor: color,
        backgroundColor: colorRGBA,
        tension: 0.1,
      };
    });
  
    return {
      labels,
      datasets,
    };
  }, [transformedData, selectedTags, filter]);
  

  const chartOptions3 = useMemo(
    () => ({
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: filter === 'year' // Check specifically for 'year'
              ? 'Years'
              : filter === 'quarter'
              ? 'Quarters'
              : filter === 'currentYear' || filter === 'previousYear'
              ? 'Months'
              : ['past7', 'customDate', 'currentMonth'].includes(filter)
              ? 'Days'
              : '',
          },
          
          
        },
        y: {
          title: {
            display: true,
            text: 'Revenue (lac)',
          },
          ticks: {
            callback: value => `${value} L`, // Format tick values in lacs
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: context => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += `${context.parsed.y} L`;
              }
              return label;
            },
          },
        },
      },
    }),
    [filter, transformedData],
  );

  const onDateChange3 = val => {
    setStartDate1(val[0]);
    setEndDate1(val[1]);
  };

  const handleReset3 = () => {
    setFilter('');
    setActiveView('');
    setStartDate1(null);
    setEndDate1(null);
    setSelectedTags([]);
  };

  const handleMenuItemClick3 = value => {
    setFilter(value);
    setActiveView(value);
  };
  const tags = additionalTagsQuery.data || [];
  const options = tags.map(tag => ({ value: tag, label: tag }));

  const tableData3 = useMemo(() => {
    if (!transformedData || Object.keys(transformedData).length === 0) {
      return [];
    }

    let timeUnits = [];

    if (filter === 'past10Years' || filter === 'past5Years') {
      timeUnits =
        filter === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
    } else if (filter === 'previousYear' || filter === 'currentYear') {
      timeUnits = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
    } else if (filter === 'currentMonth') {
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      timeUnits = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    } else if (filter === 'past7') {
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();
      timeUnits = past7Days;
    } else if (filter === 'customDate' && startDate1 && endDate1) {
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        customRangeDates.push(
          currentDate.toLocaleString('default', { month: 'short', day: 'numeric' }),
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
      timeUnits = customRangeDates;
    } else if (filter === 'quarter') {
      // Define quarterly time units
      
      timeUnits = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
    }

    const tableRows3 = selectedTags.map(tag => {
      const row = { tag };
      let totalForTag = 0;

      // Populate data for each time unit
      timeUnits.forEach(timeUnit => {
        const revenue = transformedData[timeUnit]?.[tag] || 0;
        row[timeUnit] = revenue > 0 ? (revenue / 100000).toFixed(2) : '-';
        totalForTag += revenue;
      });

      // Add grand total for the tag
      row['Grand Total'] = totalForTag > 0 ? (totalForTag / 100000).toFixed(2) : '-';
      return row;
    });

    // Create grand total row for all tags across all time units
    const grandTotalRow = { tag: 'Grand Total' };
    let overallTotal = 0;

    timeUnits.forEach(timeUnit => {
      const total = selectedTags.reduce((sum, tag) => {
        return sum + (transformedData[timeUnit]?.[tag] || 0);
      }, 0);
      grandTotalRow[timeUnit] = total > 0 ? (total / 100000).toFixed(2) : '-';
      overallTotal += total;
    });

    grandTotalRow['Grand Total'] = overallTotal > 0 ? (overallTotal / 100000).toFixed(2) : 0;

    return [...tableRows3, grandTotalRow];
  }, [transformedData, selectedTags, filter, startDate1, endDate1]);

  const tableColumns3 = useMemo(() => {
    // Dynamic columns based on the current filter
    const dynamicColumns = [];

    if (filter === 'past10Years' || filter === 'past5Years') {
      const yearRange =
        filter === 'past10Years'
          ? generateYearRange(currentYear - 10, currentYear - 1)
          : generateYearRange(currentYear - 5, currentYear - 1);
      yearRange.forEach(year => {
        dynamicColumns.push({
          Header: year.toString(),
          accessor: year.toString(),
          disableSortBy: true,
        });
      });
    } else if (filter === 'previousYear' || filter === 'currentYear') {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      months.forEach(month => {
        dynamicColumns.push({
          Header: month,
          accessor: month,
          disableSortBy: true,
        });
      });
    } else if (filter === 'currentMonth') {
      // Show days for the current month
      const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dynamicColumns.push({
          Header: i.toString(),
          accessor: i.toString(),
          disableSortBy: true,
        });
      }
    } else if (filter === 'past7') {
      // Show only the last 7 days
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }).reverse();

      past7Days.forEach(day => {
        dynamicColumns.push({
          Header: day,
          accessor: day,
          disableSortBy: true,
        });
      });
    } else if (filter === 'customDate') {
      // Show days for custom date range
      const customRangeDates = [];
      let currentDate = new Date(startDate1);
      while (currentDate <= new Date(endDate1)) {
        customRangeDates.push(
          currentDate.toLocaleString('default', { month: 'short', day: 'numeric' }),
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
      customRangeDates.forEach(date => {
        dynamicColumns.push({
          Header: date,
          accessor: date,
          disableSortBy: true,
        });
      });
    } else if (filter === 'quarter') {
      // Add full quarter names as columns
      const quarters = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];
      quarters.forEach(quarter => {
        dynamicColumns.push({
          Header: quarter,
          accessor: quarter,
          disableSortBy: true,
        });
      });
    }
    

    return [
      {
        Header: 'Tag',
        accessor: 'tag',
        disableSortBy: true,
      },
      ...dynamicColumns,
      {
        Header: 'Grand Total',
        accessor: 'Grand Total',
        disableSortBy: true,
      },
    ];
  }, [filter, currentYear, startDate1, endDate1]);

  return (
    <div className="flex flex-col col-span-10 overflow-x-hidden">
      <div className="pt-6 w-[50rem] mx-10">
        <p className="font-bold ">Filtered Revenue Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This chart shows the filtered revenue data over different time periods.
        </p>
        <div className="flex">
          <div>
            {/* View By Dropdown */}
            <Menu shadow="md" width={130}>
              <Menu.Target>
                <Button className="secondary-button">
                  View By: {viewBy[activeView] || 'Select'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {list.map(({ label, value }) => (
                  <Menu.Item
                    key={value}
                    onClick={() => handleMenuItemClick3(value)}
                    className={classNames(
                      activeView === value && label !== 'Reset' && 'text-purple-450 font-medium',
                    )}
                  >
                    {label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>
          <div className="mx-2">
            <MultiSelect
              data={options}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="Select tags"
              searchable
              clearable
            />
          </div>
          <div>
            {filter && (
              <Button onClick={handleReset3} className="mx-2 secondary-button">
                Reset
              </Button>
            )}
          </div>
        </div>

        {filter === 'customDate' && (
          <div className="flex flex-col items-start space-y-4 py-2 ">
            <DateRangeSelector
              dateValue={[startDate1, endDate1]}
              onChange={onDateChange3}
              minDate={threeMonthsAgo} // Set minimum date to 3 months ago
              maxDate={today}
            />
          </div>
        )}
        <div className="my-4">
          <Line data={chartData3} options={chartOptions3} />
        </div>
      </div>
      <div className="col-span-12 md:col-span-12 lg:col-span-10 border-gray-450 mx-10">
        <Table COLUMNS={tableColumns3} data={tableData3} />
      </div>
    </div>
  );
};

export default TagsWiseReport;
