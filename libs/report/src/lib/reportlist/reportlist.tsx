import React, { useEffect } from 'react';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { get } from '@investai/apiservice';
import styles from './reportlist.module.css';

/* eslint-disable-next-line */
interface ReportlistProps {
  reportList: { name: string; id: number }[];
  setReportList: React.Dispatch<
    React.SetStateAction<{ name: string; id: number }[]>
  >;
  onReportClick: (reportId: number) => void;
  shouldFetchReports: boolean;
  setShouldFetchReports: (val: boolean) => void;
}

export function Reportlist({
  reportList,
  setReportList,
  onReportClick,
  shouldFetchReports,
  setShouldFetchReports,
}: ReportlistProps) {
  // const [reportData, setReportData] = useState<any>(null);

  const fetchReportList = async () => {
    try {
      const response = await get('/report-list/');
      console.log('Reports retrieved');
      console.log(typeof response.reports);
      console.log(response.reports);

      setReportList(response.reports);
    } catch (error) {
      console.error('Error fetching report list:', error);
    }
  };

  useEffect(() => {
    // Call fetchReportList when the page initially loads
    fetchReportList();
  }, []);

  useEffect(() => {
    if (shouldFetchReports) {
      // Call fetchReportList when shouldFetchReports is true (i.e., a new report is added)
      fetchReportList();
      // Reset the state to false
      setShouldFetchReports(false);
    }
  }, [shouldFetchReports, setShouldFetchReports]);

  return (
    <div className={styles['container']}>
      <List>
        {reportList.map((report) => (
          <ListItemButton
            key={report.id}
            onClick={() => onReportClick(report.id)}
            className={styles['reportlst']}
          >
            <ListItemText
              primary={report.name}
              className={styles['reportlstxt']}
            />
          </ListItemButton>
        ))}
      </List>
    </div>
  );
}
