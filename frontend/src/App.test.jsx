import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText(/Utsav AI/i)).toBeInTheDocument();
  });

  it('renders the event details form', () => {
    render(<App />);
    expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument();
  });
});