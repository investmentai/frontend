import styles from './prompt.module.css';

/* eslint-disable-next-line */
export interface PromptProps {}

export function Prompt(props: PromptProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Prompt!</h1>
    </div>
  );
}

export default Prompt;
