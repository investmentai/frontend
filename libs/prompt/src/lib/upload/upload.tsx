import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Container,
  Box,
  Snackbar,
} from '@mui/material';
import { CloudUpload, InsertDriveFile, Delete } from '@mui/icons-material';
import styles from './upload.module.css';
import { uploadDocuments } from '@investai/apiservice';

/* eslint-disable-next-line */
export interface UploadProps {}

export function Upload(props: UploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
    }
  };

  const handleFileUpload = async () => {
    if (!files || files.length === 0) {
      setMessage('No file selected. Please select a file.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const fileType = files[i]?.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'pdf' && fileType !== 'doc' && fileType !== 'docx') {
        setMessage(
          'File type not supported. Please select a PDF or Word file.'
        );
        return;
      }
    }

    try {
      await uploadDocuments(files);
      setMessage('Files uploaded successfully.');
      setFiles([]); // Reset the files state
    } catch (error) {
      setMessage('Failed to upload files. Please try again.');
    }
  };

  const handleFileRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <Container className={styles.uploadcontainer}>
      {/* <Box className={styles.formtitle}>Upload Document</Box> */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          component="label"
          startIcon={<CloudUpload />}
          className={styles.fileselect}
        >
          Select Files
          <input
            accept=".doc,.docx,.xls,.xlsx,.pdf, .rtf, .txt"
            className="document-uploader-input"
            id="document-upload"
            multiple
            type="file"
            onChange={handleFileChange}
            hidden
          />
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={files.length === 0}
          onClick={handleFileUpload}
          className={styles.uploadbtn}
        >
          Upload
        </Button>
      </Box>
      <Box className={styles.uploadfiles}>
        {files &&
          files.map((file, index) => (
            <Box key={index} className={styles.uploadfile}>
              <InsertDriveFile className={styles.iconfile} />
              <Typography className={styles.uploadfname}>
                <a
                  href={URL.createObjectURL(file)}
                  download={file.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.name.length > 30
                    ? `${file.name.substring(0, 30)} ..`
                    : file.name}
                </a>
              </Typography>
              <IconButton
                color="secondary"
                onClick={() => handleFileRemove(index)}
                className={styles.delfile}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
      </Box>
    </Container>
  );
}

export default Upload;
