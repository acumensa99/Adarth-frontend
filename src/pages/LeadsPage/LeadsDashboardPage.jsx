import { Download } from 'react-feather';
import { useLeadStats } from '../../apis/queries/leads.queries';
import { useShareReport } from '../../apis/queries/report.queries';
import LeadsList from '../../components/modules/leads/LeadsList';
import LeadsStats from '../../components/modules/leads/LeadsStats';
import { downloadPdf } from '../../utils';
import { Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

const LeadsDashboardPage = () => {
  const leadStatsQuery = useLeadStats();
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
    <div className="overflow-y-auto px-3 col-span-10">
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
      <LeadsStats heading="Lead Stats" leadStatsData={leadStatsQuery?.data} />
      <LeadsList />
    </div>
  );
};

export default LeadsDashboardPage;
