/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card, { CardData } from './Card';

describe('Card Component', () => {
  const mockCard: CardData = {
    id: 'card-001',
    front: 'こんにちは',
    back: 'Hello',
    audioUrl: '/audio/card-001.mp3',
    languageCode: 'ja',
  };

  const mockOnPlayAudio = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('T202: renders card with front content', () => {
    render(<Card card={mockCard} />);
    
    expect(screen.getByTestId('card-card-001')).toBeInTheDocument();
    expect(screen.getByTestId('card-front')).toBeInTheDocument();
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  test('T202: flips card when clicked', () => {
    render(<Card card={mockCard} />);
    
    // Initially shows front
    expect(screen.getByTestId('card-front')).toBeInTheDocument();
    
    // Click to flip
    fireEvent.click(screen.getByTestId('card-card-001'));
    
    // Should show back
    expect(screen.getByTestId('card-back')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('T202: displays back content after flip', () => {
    render(<Card card={mockCard} />);
    
    fireEvent.click(screen.getByTestId('card-card-001'));
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  test('T202: renders audio button when audioUrl is provided', () => {
    render(<Card card={mockCard} />);
    
    expect(screen.getByTestId('audio-btn-front')).toBeInTheDocument();
  });

  test('T202: calls onPlayAudio when audio button is clicked', () => {
    render(<Card card={mockCard} onPlayAudio={mockOnPlayAudio} />);
    
    const audioBtn = screen.getByTestId('audio-btn-front');
    fireEvent.click(audioBtn);
    
    expect(mockOnPlayAudio).toHaveBeenCalledWith('card-001');
    expect(mockOnPlayAudio).toHaveBeenCalledTimes(1);
  });

  test('T202: audio button click does not flip the card', () => {
    render(<Card card={mockCard} onPlayAudio={mockOnPlayAudio} />);
    
    // Click audio button
    const audioBtn = screen.getByTestId('audio-btn-front');
    fireEvent.click(audioBtn);
    
    // Card should still show front (not flipped)
    expect(screen.getByTestId('card-front')).toBeInTheDocument();
    expect(screen.queryByTestId('card-back')).not.toBeInTheDocument();
  });

  test('T202: supports keyboard navigation for flipping', () => {
    render(<Card card={mockCard} />);
    
    const cardElement = screen.getByTestId('card-card-001');
    cardElement.focus();
    
    // Test Enter key
    fireEvent.keyDown(cardElement, { key: 'Enter', code: 'Enter' });
    expect(screen.getByTestId('card-back')).toBeInTheDocument();
    
    // Test Space key
    fireEvent.keyDown(cardElement, { key: ' ', code: 'Space' });
    expect(screen.getByTestId('card-front')).toBeInTheDocument();
  });

  test('T202: can be initially flipped', () => {
    render(<Card card={mockCard} initialFlipped={true} />);
    
    expect(screen.getByTestId('card-back')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  test('T202: renders without audio button if no audioUrl', () => {
    const cardWithoutAudio: CardData = {
      ...mockCard,
      audioUrl: undefined,
    };
    
    render(<Card card={cardWithoutAudio} />);
    
    expect(screen.queryByTestId('audio-btn-front')).not.toBeInTheDocument();
  });

  test('T202: displays language code on back side', () => {
    render(<Card card={mockCard} />);
    
    fireEvent.click(screen.getByTestId('card-card-001'));
    
    expect(screen.getByText('JA')).toBeInTheDocument();
  });

  test('T202: has proper accessibility attributes', () => {
    render(<Card card={mockCard} />);
    
    const cardElement = screen.getByTestId('card-card-001');
    expect(cardElement).toHaveAttribute('role', 'button');
    expect(cardElement).toHaveAttribute('tabIndex', '0');
    expect(cardElement).toHaveAttribute('aria-label');
  });

  test('T202: flips back when clicked again', () => {
    render(<Card card={mockCard} />);
    
    // Flip to back
    fireEvent.click(screen.getByTestId('card-card-001'));
    expect(screen.getByTestId('card-back')).toBeInTheDocument();
    
    // Flip back to front
    fireEvent.click(screen.getByTestId('card-card-001'));
    expect(screen.getByTestId('card-front')).toBeInTheDocument();
  });
});
