/**
 * DeckManager Component
 * Displays deck list, import functionality, and deck selection for practice
 * Uses mock data for initial development
 */

import React, { useState } from 'react';

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  languageCode: string;
  createdAt: Date;
}

interface DeckManagerProps {
  onDeckSelect?: (deckId: string) => void;
  onImportDeck?: () => void;
}

/**
 * Mock data for development
 */
const MOCK_DECKS: Deck[] = [
  {
    id: 'deck-001',
    name: '日本語 - 基礎単語',
    description: 'Basic Japanese vocabulary',
    cardCount: 50,
    languageCode: 'ja',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'deck-002',
    name: '日本語 - 動詞活用',
    description: 'Japanese verb conjugations',
    cardCount: 30,
    languageCode: 'ja',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'deck-003',
    name: 'English - Common Phrases',
    description: 'Common English phrases for daily conversation',
    cardCount: 45,
    languageCode: 'en',
    createdAt: new Date('2024-02-01'),
  },
];

export const DeckManager: React.FC<DeckManagerProps> = ({
  onDeckSelect,
  onImportDeck,
}) => {
  const [decks, setDecks] = useState<Deck[]>(MOCK_DECKS);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const handleDeckClick = (deckId: string) => {
    setSelectedDeckId(deckId);
    onDeckSelect?.(deckId);
  };

  const handleImport = () => {
    // TODO: Implement actual import logic
    onImportDeck?.();
    alert('Import functionality will be implemented in youtube-import-pipeline');
  };

  return (
    <div className="deck-manager" data-testid="deck-manager">
      <div className="deck-manager__header">
        <h2>My Decks</h2>
        <button
          className="deck-manager__import-btn"
          onClick={handleImport}
          data-testid="import-deck-btn"
        >
          Import Deck
        </button>
      </div>

      <div className="deck-manager__list" data-testid="deck-list">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className={`deck-manager__item ${
              selectedDeckId === deck.id ? 'deck-manager__item--selected' : ''
            }`}
            onClick={() => handleDeckClick(deck.id)}
            data-testid={`deck-item-${deck.id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleDeckClick(deck.id);
              }
            }}
          >
            <div className="deck-manager__item-info">
              <h3 className="deck-manager__item-name">{deck.name}</h3>
              <p className="deck-manager__item-description">{deck.description}</p>
              <div className="deck-manager__item-meta">
                <span className="deck-manager__item-count">
                  {deck.cardCount} cards
                </span>
                <span className="deck-manager__item-language">
                  {deck.languageCode.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="deck-manager__empty" data-testid="empty-decks">
          <p>No decks yet. Import a deck to get started!</p>
        </div>
      )}
    </div>
  );
};

export default DeckManager;
