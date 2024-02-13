import { render } from '@testing-library/react';

import Promptbox from './promptbox';

describe('Promptbox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Promptbox />);
    expect(baseElement).toBeTruthy();
  });
});
