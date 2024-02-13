import { render } from '@testing-library/react';

import Reportadd from './reportadd';

describe('Reportadd', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Reportadd />);
    expect(baseElement).toBeTruthy();
  });
});
