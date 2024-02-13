import styles from './sec.module.css';
import React, { useState } from 'react';
import { Button, Container, Box, Snackbar, TextField } from '@mui/material';

import MuiAlert from '@mui/material/Alert';
import { post } from '@investai/apiservice';

/* eslint-disable-next-line */
export interface SecProps {}

export function Sec(props: SecProps) {
  const [inputText, setInputText] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleApiRequest = async () => {
    try {
      const url = inputText;
      setInputText('');
      const response = await post('/retrieve-sec/', { url });
      setApiResponse(response.message);
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('API request failed:', error.message);
      setApiResponse('Error occurred while making the API request.');
      setSnackbarOpen(true);
    }
  };
  return (
    <Container className={styles.seccontainer}>
      {/* <Box className={styles.formtitle}>Upload Document</Box> */}
      <Box>
        <TextField
          label="Enter SEC Url"
          variant="outlined"
          fullWidth
          multiline
          rows={2} // Set the number of rows
          sx={{ mb: 2 }} // Add margin at the bottom (optional)
          value={inputText}
          onChange={handleInputChange}
          className={styles.txtbox}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleApiRequest}
          className={styles.btn}
        >
          Save SEC File
        </Button>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <MuiAlert elevation={6} variant="filled" severity="info">
            {apiResponse}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Sec;
