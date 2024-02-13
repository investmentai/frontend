import styles from './report.module.css';
import React, { useEffect, useState } from 'react';
// import { ReportActions } from '@investai/report';
import { ReportActions } from './reportactions/reportactions';
import { post } from '@investai/apiservice';

/* eslint-disable-next-line */
export interface ReportProps {
  reportId: number;
}

export interface Section {
  id: number;
  title: string;
  content: string;
}

const Report: React.FC<ReportProps> = ({ reportId }) => {
  const [reportData, setReportData] = useState<any>(null);
  const [reportVersionId, setReportVersionId] = useState<any>(null);
  const [documentSummary, setDocumentSummary] = useState<
    { title: string; content: string }[]
  >([]);

  const loadReportVersion = async (reportId: number, versionId: number) => {
    if (reportId !== 0 && versionId !== 0) {
      try {
        console.log(
          'Retrieving report id version id ' + reportId + ' - ' + versionId
        );
        const response = await post('/report/', {
          reportId: reportId,
          versionId: versionId,
        });
        setReportData(response);
        console.log('retrieved report version');

        console.log(typeof response.sections);
        console.log(JSON.stringify(response.sections));
        // Check if response.sections is defined and is an array
        if (response.sections && Array.isArray(response.sections)) {
          response.sections.map(({ section }: { section: Section }) =>
            console.log(JSON.stringify(section))
          );
        }
      } catch (error) {
        console.error('Error retrieving report version:', error);
      }
    }
  };

  useEffect(() => {
    loadReportVersion(reportId, reportVersionId);
  }, [reportId, reportVersionId]);

  const handleChangeReport = async (reportId: number) => {
    if (reportId !== 0) {
      try {
        console.log('Retrieving report id ' + reportId);
        // TODO: SUBJECT TO CHANGE - Default version is 1
        const reportVersionId = 1;
        loadReportVersion(reportId, reportVersionId);
        // const response = await post('/report/', {
        //   reportId: reportId,
        // });
        // setReportData(response);
        // console.log('retrieved report');
        // console.log(JSON.stringify(response));
      } catch (error) {
        console.error('Error retrieving report:', error);
      }
    }
  };

  useEffect(() => {
    console.log(`ReportId changed to: ${reportId}`);
    handleChangeReport(reportId);
  }, [reportId]);

  useEffect(() => {
    // Perform any actions when documentSummary is updated
    console.log('documentSummary updated:', documentSummary);
  }, [documentSummary]);
  return (
    <div className={styles['container']}>
      <ReportActions
        reportId={reportId}
        setDocumentSummary={setDocumentSummary}
        loadReportVersion={loadReportVersion}
        setReportVersionId={setReportVersionId}
      />
      {documentSummary.length > 0
        ? // If documentSummary is available, display the summary
          documentSummary.map((entry, index) => (
            <div key={index}>
              <h1>{entry.title}</h1>
              <p>{entry.content}</p>
            </div>
          ))
        : // If documentSummary is not available, display reportData
          reportData && (
            <div>
              <h1>{reportData.name}</h1>
              {reportData.sections &&
                reportData.sections.map((section: Section) => (
                  <div key={section.id}>
                    <h1>{section.title}</h1>
                    <p>{section.content}</p>
                  </div>
                ))}
            </div>
          )}
    </div>
  );
};

export default Report;
