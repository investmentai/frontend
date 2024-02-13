import React, { useState } from 'react';
import { Button, Container, TextField, Grid } from '@mui/material';
import { Send } from '@mui/icons-material';
import styles from './promptbox.module.css';
import { post } from '@investai/apiservice';

/* eslint-disable-next-line */
export interface PromptboxProps {
  setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
  setResponseMessage: React.Dispatch<React.SetStateAction<string>>;
  // handlePromptChange: (newMessage: string) => void;
  // handlePromptApiCall: () => string;
}

const Promptbox: React.FC<PromptboxProps> = ({
  setCurrentMessage,
  setResponseMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const getLLMResponse = async (promptText: string) => {
    // const messageAI = `AI: Thanks ${currentMessage}`;
    console.log('getting llm response');
    console.log(promptText);
    if (promptText === '') {
      return;
    }

    const response = await post('/chat/', {
      prompt: promptText,
    });
    console.log('response from server: ');
    console.log(JSON.stringify(response));
    setResponseMessage(response.message);
    // setMessages((prevMessages) => [...prevMessages, response.message]);
  };

  const handlePromptSubmit = () => {
    // You can handle the submission logic here, such as making an API call
    console.log(`Submitted: ${inputText}`);
    setCurrentMessage('User: ' + inputText);
    const promptText = inputText;
    setInputText('');
    // setResponseMessage('Thinking...');
    getLLMResponse(promptText);
  };

  return (
    <Container className={styles.promptcontainer}>
      <Grid container spacing={2}>
        <Grid item xs={11}>
          <TextField
            label="Enter message"
            variant="outlined"
            fullWidth
            multiline
            rows={1}
            value={inputText}
            onChange={handlePromptChange}
            className={styles.promptext}
          />
        </Grid>
        <Grid item xs={1} className={styles.grdpromptbtn}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePromptSubmit}
            endIcon={<Send />}
            className={styles.promptbtn}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Promptbox;
