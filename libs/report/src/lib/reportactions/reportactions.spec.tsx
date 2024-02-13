import { render } from '@testing-library/react';

import Reportactions from './reportactions';

describe('Reportactions', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Reportactions />);
    expect(baseElement).toBeTruthy();
  });
});
