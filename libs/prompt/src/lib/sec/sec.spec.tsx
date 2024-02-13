import { render } from '@testing-library/react';

import Sec from './sec';

describe('Sec', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Sec />);
    expect(baseElement).toBeTruthy();
  });
});
