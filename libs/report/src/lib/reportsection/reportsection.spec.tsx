import { render } from '@testing-library/react';

import Reportsection from './reportsection';

describe('Reportsection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Reportsection />);
    expect(baseElement).toBeTruthy();
  });
});
