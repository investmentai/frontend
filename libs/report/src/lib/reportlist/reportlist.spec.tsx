import { render } from '@testing-library/react';

import Reportlist from './reportlist';

describe('Reportlist', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Reportlist />);
    expect(baseElement).toBeTruthy();
  });
});
