import { showNotification } from "@mantine/notifications";
import { useShareReport } from "../../apis/queries/report.queries";
import { downloadPdf } from "../../utils";
import { Button } from "@mantine/core";
import { Download } from "react-feather";


const OtherNewReports = () => {
  
  // existing campaing card
  const { mutateAsync, isLoading: isDownloadLoading } = useShareReport();
  const handleDownloadPdf = async () => {
    const activeUrl = new URL(window.location.href);
    activeUrl.searchParams.append('share', 'report');

    await mutateAsync(
      { url: activeUrl.toString() },
      {
        onSuccess: data => {
          showNotification({
            title: 'Report has been downloaded successfully',
            color: 'green',
          });
          if (data?.link) {
            downloadPdf(data.link);
          }
        },
      },
    );
  };
  return (
    <div className="">
      <div className="py-5 flex items-start">
       <Button
          leftIcon={<Download size="20" color="white" />}
          className="primary-button"
          onClick={handleDownloadPdf}
          loading={isDownloadLoading}
          disabled={isDownloadLoading}
        >
          Download
        </Button>
        </div>
      {/* <div className="flex justify-between ">
    <div className="overflow-y-auto px-3 col-span-10 overflow-hidden">
      <div className="flex justify-between ">
        
        <div className="py-5 flex items-start">
          <Button
            leftIcon={<Download size="20" color="white" />}
            className="primary-button "
            onClick={handleDownloadExcel}
            loading={isDownloadLoading}
            disabled={isDownloadLoading}
          >
            Download Income Statement
          </Button>
        </div>
      </div> */}
      {/* <div className="border-2 p-5 border-black"> */}
        <p className="font-bold text-lg"> Revenue </p>
        <div className="overflow-hidden p-5 ">
          {/* <RevenueCards /> */}
        </div>
        {/* <div className="flex flex-col md:flex-row">
          <div className="flex flex-col p-6 w-[30rem]">
            <p className="font-bold text-center">Source Distribution</p>
            <p className="text-sm text-gray-600 italic pt-3">
            This chart shows the revenue split between "Own Sites" and "Traded Sites".
            </p>
            <div className="flex gap-8 mt-6 justify-center">
              <div className="flex gap-2 items-center">
                <div className="h-4 w-4 rounded-full bg-orange-350" />
                <div>
                  <p className="my-2 text-xs font-light">Own Sites</p>
                  <p className="text-sm">₹{dummyStats.ownsite}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-4 w-4 rounded-full bg-purple-350" />
                <div>
                  <p className="my-2 text-xs font-light">Traded sites</p>
                  <p className="text-sm">₹ {dummyStats.tradedsite}</p>
                </div>
              </div>
            </div>
            <div className="w-80 mt-4 ">
              {printSitesData.datasets[0].data.length === 0 ? (
                <p className="text-center">NA</p>
              ) : (
                <Doughnut options={config.options} data={printSitesData} />
              )}
            </div>
          </div>
          <div className="flex mt-2">
            <div className="flex flex-col gap-4 text-center">
              <div className="flex flex-col gap-4 p-4 items-center min-h-[200px]">
                <p className="font-bold">Client Type Distribution</p>
                <p className="text-sm text-gray-600 italic">
                This chart breaks down revenue by client type, including "Direct Clients", "Local Agencies", "National Agencies", and "Government".
                </p>
                <div className="w-72">
                  {isLoadingBookingData ? (
                    <p className="text-center">Loading...</p>
                  ) : updatedClient.datasets[0].data.length === 0 ? (
                    <p className="text-center">NA</p>
                  ) : (
                    <Pie
                      data={updatedClient}
                      options={barDataConfigByClient.options}
                      height={200}
                      width={200}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 w-[50rem]">
        <p className="font-bold ">Revenue Distribution</p>
        <p className="text-sm text-gray-600 italic py-4">
        This line chart shows revenue trends over selected time periods, with revenue displayed in lakhs.
        </p>
        <Menu shadow="md" width={130}>
          <Menu.Target>
            <Button className="secondary-button">View By: {viewBy[activeView] || 'Select'}</Button>
          </Menu.Target>
          <Menu.Dropdown>
            {list.map(({ label, value }) => (
              <Menu.Item
                key={value}
                onClick={() => handleMenuItemClick(value)}
                className={classNames(
                  activeView === value && label !== 'Reset' && 'text-purple-450 font-medium',
                )}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {filter && (
          <Button onClick={handleReset} className="mx-2 secondary-button">
            Reset
          </Button>
        )}

        {filter === 'customDate' && (
          <div className="flex flex-col items-start space-y-4 py-2 ">
            <DateRangeSelector dateValue={[startDate2, endDate2]} onChange={onDateChange} />
          </div>
        )}

        <div className="my-4">
          <Line data={chartData1} options={chartOptions1} />
        </div>
      </div> */}
      {/* <div className={classNames('overflow-y-auto px-5 col-span-10 overflow-x-hidden')}>
          <div className="my-6 w-[60rem]" id="revenue-pdf">
          
            <div className="flex gap-8">
              <div className="w-[70%] flex flex-col justify-between min-h-[300px]">
                <div className="flex justify-between items-center">
                  <p className="font-bold">Revenue Graph</p>
                </div>
                <div className="h-[60px] mt-5 border-gray-450 flex ">
              <ViewByFilter handleViewBy={handleRevenueGraphViewBy} />
            </div>
                {isRevenueGraphLoading ? (
                  <Loader className="m-auto" />
                ) : (
                  <div className="flex flex-col pl-7 relative">
                    <p className="transform rotate-[-90deg] absolute left-[-38px] top-[40%] text-sm">
                      Amount in INR &gt;
                    </p>
                    <div className="max-h-[350px]">
                      <Line
                        data={updatedReveueGraph}
                        options={options}
                        key={updatedReveueGraph.id}
                        className="w-full"
                      />
                    </div>
                    <p className="text-center text-sm">{timeLegend[groupBy]} &gt;</p>
                  </div>
                )}
              </div>
              <div className="w-[30%] flex flex-col mt-10">
                <div className="flex justify-between items-start">
                  <p className="font-bold ml-9">Industry wise revenue graph</p>
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
      </div> */}

        {/* <div className="flex flex-col md:flex-row  w-[60rem] px-4">
        <div className="pt-6 w-[40rem]">
          <p className="font-bold "> Category Wise Filtered Revenue Report</p>
          <p className="text-sm text-gray-600 italic py-4">
            This chart shows the filtered revenue data over different time periods.
          </p>
          <div className="flex">
            <div>
              <Menu shadow="md" width={130}>
                <Menu.Target>
                  <Button className="secondary-button">
                    View By: {viewBy[activeView4] || 'Select'}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {list.map(({ label, value }) => (
                    <Menu.Item
                      key={value}
                      onClick={() => handleMenuItemClick4(value)}
                      className={classNames(activeView4 === value && 'text-purple-450 font-medium')}
                    >
                      {label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </div>
            <div className="mx-2">
            <Menu shadow="md" width={130}>
              <Menu.Target>
                <Button className="secondary-button">
                  {selectedCategory ? `Category: ${selectedCategory}` : 'Select Category'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {categoryList.map(category => (
                  <Menu.Item key={category} onClick={() => setSelectedCategory(category)}>
                    {category}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            </div>
            <div>
              {filter4 && (
                <Button onClick={handleReset4} className="mx-2 secondary-button">
                  Reset
                </Button>
              )}
            </div>
          </div>
          {filter4 === 'customDate' && (
            <div className="flex flex-col items-start space-y-4 py-2 ">
              <DateRangeSelector
                dateValue={[startDate1, endDate1]}
                onChange={onDateChange4}
                minDate={threeMonthsAgo}
                maxDate={today}
              />
            </div>
          )}

          <div className=" my-4">
            <Bar  ref={chartRef} data={chartData4} options={chartOptions4}  plugins={[ChartDataLabels]}/>
          </div>
        </div>
        
      </div> */}
       
        
      {/* </div> */}
      {/* <div className="flex p-6 flex-col ">
        <div className="flex justify-between items-center">
          <p className="font-bold">Sales Report</p>
        </div>
        <p className="text-sm text-gray-600 italic pt-3">
          This chart displays total sales over the past three years with a trend line showing the
          average sales.
        </p>
        {isLoadingBookingData ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : (
          <div className="">
            {salesData.length > 0 ? (
              <div className=" gap-10 ">
                <div className="pt-4 w-[50rem]">
                  <Bar ref={chartRef} data={combinedChartData} options={combinedChartOptions} plugins={[ChartDataLabels]}/>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600">No data available.</p>
            )}
          </div>
        )}
      </div> */}
      
      {/* <div className="flex flex-col col-span-10 overflow-x-hidden">
        <div className="pt-6 w-[50rem] mx-10">
          <p className="font-bold ">Tag Wise Filtered Revenue Report</p>
          <p className="text-sm text-gray-600 italic py-4">
            This chart shows the filtered revenue data over different time periods.
          </p>
          <div className="flex">
            <div>
              <Menu shadow="md" width={130}>
                <Menu.Target>
                  <Button className="secondary-button">
                    View By: {viewBy[activeView3] || 'Select'}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {list.map(({ label, value }) => (
                    <Menu.Item
                      key={value}
                      onClick={() => handleMenuItemClick3(value)}
                      className={classNames(
                        activeView3 === value && label !== 'Reset' && 'text-purple-450 font-medium',
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
                placeholder="Select Additional Tags"
                searchable
                clearable
              />
            </div>
            <div>
              {filter3 && (
                <Button onClick={handleReset3} className="mx-2 secondary-button">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {filter3 === 'customDate' && (
            <div className="flex flex-col items-start space-y-4 py-2 ">
              <DateRangeSelector
                dateValue={[startDate1, endDate1]}
                onChange={onDateChange3}
                minDate={threeMonthsAgo}
                maxDate={today}
              />
            </div>
          )}
          <div className="my-4">
            <Line data={chartData3} options={chartOptions3} />
          </div>
        </div>
        <div className="col-span-12 md:col-span-12 lg:col-span-10 border-gray-450 mx-10  h-[400px]">
          <Table COLUMNS={tableColumns3} data={tableData3} showPagination={false} />
        </div>
      </div> */}

      {/* <div className="col-span-12 md:col-span-12 lg:col-span-10 overflow-y-auto p-5">
        <p className="font-bold pt-10">Price and Traded Margin Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report provide insights into the pricing trends, traded prices, and margins grouped
          by cities.
        </p>
        <div className="overflow-y-auto h-[400px]">
          <Table
            data={processedData || []}
            COLUMNS={columns3}
            loading={isLoadingInventoryData}
            showPagination={false}
          />
        </div>
      </div>
      <div className="col-span-12 md:col-span-12 lg:col-span-10 p-5 overflow-hidden">
        <p className="font-bold ">Invoice and amount collected Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report provide insights into the invoice raised, amount collected and outstanding by
          table, graph and chart.
        </p>
        <div className="flex py-4">
          <div style={{ position: 'relative', zIndex: 10 }}>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button className="secondary-button">
                  View By: {viewBy1[activeView1] || 'Select'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {list1.map(({ label, value }) => (
                  <Menu.Item
                    key={value}
                    onClick={() => handleMenuItemClick1(value)}
                    className={classNames(activeView1 === value && 'text-purple-450 font-medium')}
                  >
                    {label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </div>

          {activeView1 && (
            <Button onClick={handleReset1} className="mx-2 secondary-button">
              Reset
            </Button>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-10  overflow-x-auto">
          <div className="overflow-y-auto w-[600px] h-[400px]">
            <Table
              data={groupedData1 || []}
              COLUMNS={column1}
              loading={isLoadingInventoryData}
              showPagination={false}
            />
          </div>
          <div className="flex flex-col">
            <p className="pb-6 font-bold text-center">Invoice Raised Vs Amount Collected</p>
            <GaugeChart
              invoiceRaised={isFilterApplied ? invoiceRaised : 0}
              amountCollected={isFilterApplied ? amountCollected : 0}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="py-10 font-bold">Invoice Raised Vs Amount Collected Vs Outstanding</p>
          <InvoiceReportChart data={activeView1 ? groupedData1 : []} />{' '}
        </div>
      </div>
      <div className="overflow-y-auto px-5 col-span-10 w-[65rem]">
        <p className="font-bold pt-10">Performance Ranking Report</p>
        <p className="text-sm text-gray-600 italic py-4">
          This report shows Performance Cards with pagination controls and a sortable, paginated
          table.
        </p>
        <PerformanceCard />
      </div>
      <div className='px-5'>
      <p className="font-bold py-4">Campaigns stats report</p>
      <div className="flex w-1/3 gap-4 h-[250px] ">
      
        <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
          <div className="w-32">
            {isStatsLoading ? (
              <Loader className="mx-auto" />
            ) : stats?.printOngoing === 0 && stats?.printCompleted === 0 ? (
              <p className="text-center">NA</p>
            ) : (
              <Doughnut options={config.options} data={printStatusData} />
            )}
          </div>
          <div>
            <p className="font-medium">Printing Status</p>
            <div className="flex gap-8 mt-6 flex-wrap">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                <div>
                  <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                  <p className="font-bold text-lg">{stats?.printOngoing ?? 0}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                <div>
                  <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                  <p className="font-bold text-lg">{stats?.printCompleted ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 p-4 border rounded-md items-center min-h-[200px]">
          <div className="w-32">
            {isStatsLoading ? (
              <Loader className="mx-auto" />
            ) : stats?.mountOngoing === 0 && stats?.mountCompleted === 0 ? (
              <p className="text-center">NA</p>
            ) : (
              <Doughnut options={config.options} data={mountStatusData} />
            )}
          </div>
          <div>
            <p className="font-medium">Mounting Status</p>
            <div className="flex gap-8 mt-6 flex-wrap">
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 bg-orange-350 rounded-full" />
                <div>
                  <p className="my-2 text-xs font-light text-slate-400">Ongoing</p>
                  <p className="font-bold text-lg">{stats?.mountOngoing ?? 0}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-2 w-1 p-2 rounded-full bg-purple-350" />
                <div>
                  <p className="my-2 text-xs font-light text-slate-400">Completed</p>
                  <p className="font-bold text-lg">{stats?.mountCompleted ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div> */}
    </div>
  );
};

export default OtherNewReports;
