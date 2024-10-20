import { Outlet, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';

const LeadsPage =() => {
  const [searchParams] = useSearchParams();
  const share = searchParams.get('share');

  return (
    <div>
      {share !== 'report' ? <Header title="Leads" /> : null}
      <div className="grid grid-cols-12 h-[calc(100vh-60px)]">
        {share !== 'report' ? <Sidebar /> : null}
        <Outlet />
      </div>
    </div>
  );
};

export default LeadsPage;
