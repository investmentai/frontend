import { render } from '@testing-library/react';

import Apiservice from './apiservice';

describe('Apiservice', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Apiservice />);
    expect(baseElement).toBeTruthy();
  });
});
