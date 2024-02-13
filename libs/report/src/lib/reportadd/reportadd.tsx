import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { post } from '@investai/apiservice';
import styles from './reportadd.module.css';

/* eslint-disable-next-line */
interface ReportAddProps {
  onAddReport: (reportId: number) => void;
  notifyReportAdded: () => void;
}

export const ReportAdd: React.FC<ReportAddProps> = ({
  onAddReport,
  notifyReportAdded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportName, setReportName] = useState('');

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAddReport = async () => {
    console.log('Report name ' + reportName);
    if (reportName.trim() !== '') {
      try {
        const response = await post('/report-new/', { reportName });
        console.log('added report');
        console.log(JSON.stringify(response));
        const reportId = response.reportId;

        if (reportId) {
          onAddReport(reportId);
          setReportName('');
          handleClose();
          // Notify the parent (Chat) component about the new report
          notifyReportAdded();
        } else {
          console.error('Failed to add a new report');
        }
      } catch (error) {
        console.error('Error adding a new report:', error);
      }
    }
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleOpen}>
        Add Report
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>Create a New Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Report Name"
            type="text"
            fullWidth
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddReport();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddReport} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
