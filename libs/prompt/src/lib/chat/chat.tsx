import styles from './chat.module.css';
import Promptbox from '../promptbox/promptbox';
import Upload from '../upload/upload';
import Sec from '../sec/sec';
import { useState, useEffect } from 'react';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
// import ReportActions from '../../../../../libs/report/src/lib/reportactions/reportactions';
// import ReportActions from '@investai/reportactions';
// import { Report } from '@investai/report';
import { Report, ReportAdd, Reportlist } from '@investai/report';

/* eslint-disable-next-line */
export interface ChatProps {}

export function Chat(props: ChatProps) {
  const [reportId, setReportId] = useState<number>(0);
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [expandedPanel, setExpandedPanel] = useState(-1);
  const [reportList, setReportList] = useState<{ name: string; id: number }[]>(
    []
  );
  const [shouldFetchReports, setShouldFetchReports] = useState<boolean>(false);

  const onAddReport = (reportId: number) => {
    setReportId(reportId);
    console.log('on report add called, report added with number' + reportId);
  };

  const notifyReportAdded = () => {
    // Set the boolean state to trigger the fetch in ReportList
    setShouldFetchReports(true);
  };

  const onReportClick = async (reportId: number) => {
    if (reportId !== 0) {
      setReportId(reportId);
    }
  };

  const getReportMenuContent = () => {
    return (
      <>
        <Reportlist
          reportList={reportList}
          setReportList={setReportList}
          onReportClick={onReportClick}
          shouldFetchReports={shouldFetchReports}
          setShouldFetchReports={setShouldFetchReports}
        />
        <ReportAdd
          onAddReport={onAddReport}
          notifyReportAdded={notifyReportAdded}
        />
      </>
    );
  };

  const accordionData = [
    {
      title: 'Reports',
      content: getReportMenuContent(),
    },
    { title: 'Integrations', content: 'Integrations' },
    { title: 'Data Rooms', content: <Upload /> },
    { title: 'SEC Files', content: <Sec /> },
    { title: 'Filter', content: 'Filter company files you work on' },
    // Add more items as needed
  ];

  useEffect(() => {
    if (currentMessage.trim() === '' && responseMessage.trim() === '') {
      return;
    }

    if (currentMessage.trim() !== '') {
      // Update messages array with the currentMessage
      console.log('updating with message');
      setMessages((prevMessages) => [...prevMessages, currentMessage]);
      // Clear the current message
      setCurrentMessage('');
    }

    if (currentMessage.trim() === '' && responseMessage.trim() !== '') {
      // Update messages array with the currentMessage
      console.log('updating with message');
      // const newMessages = messages.slice(0, -1); // Remove the last message ("Thinking...")
      // newMessages.push(responseMessage);
      // setMessages(newMessages);
      // Clear the response message
      setMessages((prevMessages) => [...prevMessages, responseMessage]);
      setResponseMessage('');
    }
  }, [currentMessage, responseMessage, messages]);

  const handlePanelChange = (panelIndex: number) => {
    setExpandedPanel(panelIndex);
  };

  // TODO: Move the ui components to chat page
  return (
    <Grid container spacing={2} className="main-container">
      <Grid item xs={3} className={`${styles.columngrd}`}>
        <Paper className={`${styles.column} ${styles.column1}`}>
          {accordionData.map((item, index) => (
            <Accordion
              key={index}
              expanded={expandedPanel === index}
              onChange={() => handlePanelChange(index)}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`panel${index + 1}a-content`}
                id={`panel${index + 1}a-header`}
                // aria-controls={`panel${index + 1}a-content`}
              >
                <Typography>{item.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>{item.content}</AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Grid>
      <Grid item xs={5} className={`${styles.columngrd}`}>
        <Paper className={`${styles.column} ${styles.column2}`}>
          <Report reportId={reportId} />
        </Paper>
      </Grid>
      <Grid item xs={4} className={`[${styles.columngrd}`}>
        <Paper className={`${styles.column} ${styles.column3}`}>
          {/* <Promptbox /> */}
          {messages.map((message, index) => (
            <Container className={styles.promptmsg}>{message}</Container>
          ))}
          <Promptbox
            setCurrentMessage={setCurrentMessage}
            setResponseMessage={setResponseMessage}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Chat;
