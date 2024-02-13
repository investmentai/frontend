import { render } from '@testing-library/react';

import Report from './report';

describe('Report', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Report />);
    expect(baseElement).toBeTruthy();
  });
});
