import theme from './theme';

describe('1-800A MUI theme', () => {
  it('primary color is orange', () => {
    expect(theme.palette.primary.main).toBe('#F15F22');
  });

  it('secondary color is teal', () => {
    expect(theme.palette.secondary.main).toBe('#2DA38D');
  });

  it('font family starts with Poppins', () => {
    expect(theme.typography.fontFamily).toMatch(/^'Poppins'/);
  });

  it('default border radius is 8px', () => {
    expect(theme.shape.borderRadius).toBe(8);
  });
});
