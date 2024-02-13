import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save,
  Description,
  GetApp,
  Settings,
  Insights,
} from '@mui/icons-material';
import { post, get } from '@investai/apiservice';
import styles from './reportactions.module.css';
import { AnyMxRecord } from 'dns';

export interface ReportActionsProps {
  reportId: number;
  setDocumentSummary: React.Dispatch<
    React.SetStateAction<{ title: string; content: string }[]>
  >;
  loadReportVersion: (reportId: number, versionId: number) => void;
  setReportVersionId: React.Dispatch<React.SetStateAction<number>>;
}

export interface Folder {
  id: number;
  name: string;
}
export interface Document {
  id: number;
  name: string;
}

export interface Version {
  id: number;
  revision_number: number;
  modified_date: Date;
  ai_generated: boolean;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  reportId,
  setDocumentSummary,
  loadReportVersion,
  setReportVersionId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<any>('0');
  const [selectedVersionId, setSelectedVersionId] = useState<any>('1');
  const [folderName, setFolderName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [folderList, setFolderList] = useState<Folder[]>([]);
  const [documentList, setDocumentList] = useState<Document[]>([]);
  const [reportVersions, setReportVersions] = useState<Version[]>([]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleVersionClose = () => {
    setIsVersionOpen(false);
  };

  const fetchFolderList = async (): Promise<void> => {
    try {
      const response = await get('/folder-list/');
      setFolderList(response.folders);
    } catch (error) {
      console.error('Error fetching folder list:', error);
    }
  };

  const fetchDocumentList = async (): Promise<void> => {
    try {
      const response = await post('/document-list/', {
        folderId: selectedFolderId,
      });
      setDocumentList(response.documents);
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  };

  const handleFolderChange = (value: string) => {
    const selectedFolderId = folderList.find(
      (folder) => folder.name === value
    )?.id;
    setFolderName(value);
    setSelectedFolderId(selectedFolderId);
    fetchDocumentList();
  };

  const handleSummarizeDocument = async () => {
    console.log('Document name ' + documentName);
    if (documentName.trim() !== '') {
      setDocumentName('');
      handleClose();
      setDocumentSummary([]);
      try {
        const selectedDocumentId = documentList.find(
          (document) => document.name === documentName
        )?.id;
        const response = await post('/summarize/', {
          reportId: reportId,
          documentId: selectedDocumentId,
        });
        console.log('summarized report');
        console.log(typeof response.summary);
        // console.log(JSON.stringify(response.summary));

        Object.entries(response.summary).forEach(([key, value]) => {
          // Update the documentSummary state using setDocumentSummary
          const stringValue = value as string;
          const entry: { title: string; content: string } = {
            title: key,
            content: stringValue,
          };

          setDocumentSummary((prevState) => [...prevState, entry]);
          // console.log('key : ' + key);
          // console.log('value : ' + value);
        });
      } catch (error) {
        console.error('Error summarizing the report:', error);
      }
    }
  };

  const handleSave = () => {
    console.log(`Saving report ${reportId}`);
    // Implement save logic using reportId and report content
  };

  const handleVersionLoad = () => {
    loadReportVersion(reportId, selectedVersionId);
    setIsVersionOpen(false);
  };

  const handleVersion = async () => {
    console.log(`Loading version for report ${reportId}`);
    setIsVersionOpen(true);
    try {
      const response = await post('/report-versions/', {
        reportId: reportId,
      });
      console.log('versions');
      console.log(response.versions);
      setReportVersions(response.versions);
      setReportVersionId(1); // defaults to version 1
    } catch (error) {
      console.error('Error getting versions of the report:', error);
    }
  };

  const handleExport = () => {
    console.log(`Exporting report ${reportId}`);
    // Implement export logic using reportId
  };

  const handleSettings = () => {
    console.log(`Opening settings for report ${reportId}`);
    // Implement settings logic using reportId
  };

  const handleInsight = () => {
    console.log(`Opening insight for report ${reportId}`);
    setIsOpen(true);
    fetchFolderList();
    // Implement settings logic using reportId
  };

  return (
    <div className={styles.container}>
      <ButtonGroup variant="contained" color="primary">
        <Button
          onClick={handleSave}
          startIcon={<Save />}
          className={styles.actionbth}
        >
          Save
        </Button>
        <Button
          onClick={handleVersion}
          startIcon={<Description />}
          className={styles.actionbth}
        >
          Version
        </Button>
        <Button
          onClick={handleExport}
          startIcon={<GetApp />}
          className={styles.actionbth}
        >
          Export
        </Button>
        <Button
          onClick={handleSettings}
          startIcon={<Settings />}
          className={styles.actionbth}
        >
          Settings
        </Button>
        <Button
          onClick={handleInsight}
          startIcon={<Insights />}
          className={styles.actionbth}
        >
          Insights
        </Button>
      </ButtonGroup>
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>Generate Insight</DialogTitle>
        <DialogContent>
          <InputLabel id="folder-select-label">Select Folder</InputLabel>
          <Select
            labelId="folder-select-label"
            id="folder-select"
            value={folderName}
            onChange={(e) => handleFolderChange(e.target.value)}
            fullWidth
          >
            {folderList.map((folder) => (
              <MenuItem key={folder.id} value={folder.name}>
                {folder.name}
              </MenuItem>
            ))}
          </Select>
          <InputLabel id="document-select-label">Select Document</InputLabel>
          <Select
            labelId="document-select-label"
            id="document-select"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            fullWidth
          >
            {documentList.map((document) => (
              <MenuItem key={document.id} value={document.name}>
                {document.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSummarizeDocument} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isVersionOpen} onClose={handleVersionClose}>
        <DialogTitle>Select Report Version</DialogTitle>
        <DialogContent>
          <InputLabel id="version-select-label">Select Version</InputLabel>
          <Select
            labelId="version-select-label"
            id="version-select"
            value={selectedVersionId}
            onChange={(e) => setSelectedVersionId(e.target.value as string)}
            fullWidth
          >
            {reportVersions.map((version) => (
              <MenuItem
                key={version.revision_number}
                value={version.revision_number.toString()}
              >
                {version.revision_number} {version.ai_generated ? ' - AI' : ''}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVersionClose}>Cancel</Button>
          <Button onClick={handleVersionLoad} color="primary">
            Load Version
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// export default ReportActions;
