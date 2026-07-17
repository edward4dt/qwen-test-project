/**
 * Card Component
 * Displays flashcard with flip animation, showing front and back content
 * Includes audio playback button for pronunciation
 */

import React, { useState } from 'react';

export interface CardData {
  id: string;
  front: string;
  back: string;
  audioUrl?: string;
  languageCode: string;
}

interface CardProps {
  card: CardData;
  onPlayAudio?: (cardId: string) => void;
  initialFlipped?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onPlayAudio,
  initialFlipped = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping when clicking audio button
    onPlayAudio?.(card.id);
  };

  return (
    <div
      className="card"
      data-testid={`card-${card.id}`}
      onClick={handleFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleFlip();
        }
      }}
      aria-label={`Flashcard: ${card.front}. Click to flip.`}
    >
      <div className={`card__inner ${isFlipped ? 'card__inner--flipped' : ''}`}>
        {/* Front side */}
        <div className="card__face card__face--front" data-testid="card-front">
          <div className="card__content">
            <p className="card__text">{card.front}</p>
            {card.audioUrl && (
              <button
                className="card__audio-btn"
                onClick={handleAudioClick}
                data-testid="audio-btn-front"
                aria-label="Play pronunciation"
              >
                🔊
              </button>
            )}
          </div>
          <div className="card__hint">Click to flip</div>
        </div>

        {/* Back side */}
        <div
          className="card__face card__face--back"
          data-testid="card-back"
          style={{ display: isFlipped ? 'block' : 'none' }}
        >
          <div className="card__content">
            <p className="card__text">{card.back}</p>
            {card.audioUrl && (
              <button
                className="card__audio-btn"
                onClick={handleAudioClick}
                data-testid="audio-btn-back"
                aria-label="Play pronunciation"
              >
                🔊
              </button>
            )}
          </div>
          <div className="card__language-tag">
            {card.languageCode.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
