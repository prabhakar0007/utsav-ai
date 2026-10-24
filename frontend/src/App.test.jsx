import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('Utsav AI - Frontend Application Suite', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders header, title, and accessible skip link', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Utsav AI/i })).toBeInTheDocument();
    expect(screen.getByText(/Intelligent, Budget-Optimized Event Planning/i)).toBeInTheDocument();
    expect(screen.getByText(/Skip to main content/i)).toBeInTheDocument();
  });

  it('renders all form input controls with currency selector and accessible labels', () => {
    render(<App />);
    expect(screen.getByLabelText(/Event Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total Budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Theme \/ Preferred Vibe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Event Plan/i })).toBeInTheDocument();
  });

  it('renders quick presets and clicking a preset updates form values', () => {
    render(<App />);
    const birthdayPreset = screen.getByRole('button', { name: /Apply preset for 🎂 Fun Birthday/i });
    expect(birthdayPreset).toBeInTheDocument();

    fireEvent.click(birthdayPreset);

    const budgetInput = screen.getByLabelText(/Total Budget/i);
    expect(budgetInput.value).toBe('25000');
    
    const vibeInput = screen.getByLabelText(/Theme \/ Preferred Vibe/i);
    expect(vibeInput.value).toBe('Neon Glow & Interactive Games');
  });

  it('allows changing currency and reflects selected currency symbol', () => {
    render(<App />);
    const currencySelect = screen.getByLabelText(/Currency/i);
    fireEvent.change(currencySelect, { target: { value: 'USD' } });
    
    expect(currencySelect.value).toBe('USD');
    expect(screen.getByText(/Total Budget \(\$\)/i)).toBeInTheDocument();
  });

  it('displays empty state guidance before generation', () => {
    render(<App />);
    expect(screen.getByText(/Ready to Plan Your Event\?/i)).toBeInTheDocument();
  });

  it('handles successful API plan generation and renders all modules', async () => {
    const mockPlan = {
      budgetBreakdown: [
        { category: "Venue & Decor", amount: 40000 },
        { category: "Catering", amount: 45000 }
      ],
      timeline: [
        { task: "Book Venue", daysBefore: 30 },
        { task: "Send Invites", daysBefore: 15 }
      ],
      vendors: ["Royal Palace Hall", "Star Caterers"],
      personalizedIdeas: ["Welcome drinks in brass goblets", "Grand royal entrance"],
      metadata: {
        budgetAdvisory: "Balanced",
        currency: "INR"
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlan
    });

    render(<App />);
    const submitBtn = screen.getByRole('button', { name: /Generate Event Plan/i });
    fireEvent.click(submitBtn);

    // Wait for plan elements to render
    await waitFor(() => {
      expect(screen.getByText(/Budget Distribution/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Preparation Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Vendor Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Creative Ideas & Themes/i)).toBeInTheDocument();
    expect(screen.getByText(/Venue & Decor/i)).toBeInTheDocument();
    expect(screen.getByText(/Book Venue/i)).toBeInTheDocument();
    expect(screen.getByText(/Star Caterers/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome drinks in brass goblets/i)).toBeInTheDocument();
    expect(screen.getByText(/Export JSON/i)).toBeInTheDocument();
  });

  it('allows checking off timeline tasks and vendors interactively', async () => {
    const mockPlan = {
      budgetBreakdown: [{ category: "Venue", amount: 20000 }],
      timeline: [{ task: "Book Photographer", daysBefore: 20 }],
      vendors: ["Pixel Studio"],
      personalizedIdeas: ["Polaroid booth"]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlan
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Event Plan/i }));

    await waitFor(() => {
      expect(screen.getByText(/Book Photographer/i)).toBeInTheDocument();
    });

    const taskCheckbox = screen.getByLabelText(/Task: Book Photographer/i);
    expect(taskCheckbox.checked).toBe(false);

    fireEvent.click(taskCheckbox);
    expect(taskCheckbox.checked).toBe(true);

    const vendorCheckbox = screen.getByLabelText(/Vendor: Pixel Studio/i);
    expect(vendorCheckbox.checked).toBe(false);

    fireEvent.click(vendorCheckbox);
    expect(vendorCheckbox.checked).toBe(true);
  });

  it('displays error alert on server failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server overloaded" })
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Generate Event Plan/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Server overloaded/i)).toBeInTheDocument();
    });
  });

});
