import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import './SwipeCards.css';

const SwipeCards = ({ places, currentIndex, onSwipe, onNewSuggestions }) => {
    const [currentCards, setCurrentCards] = useState([]);
    const [swipeDirection, setSwipeDirection] = useState('');

    useEffect(() => {
        // Show current place and next 2 places for smooth swiping
        const cards = places.slice(currentIndex, currentIndex + 3);
        setCurrentCards(cards);
    }, [places, currentIndex]);

    const handleSwipe = (direction, place) => {
        setSwipeDirection(direction);
        onSwipe(direction, place);
        
        // Clear direction after animation
        setTimeout(() => setSwipeDirection(''), 300);
    };

    const getRatingStars = (rating) => {
        if (!rating) return 'No rating';
        const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        return `${stars} (${rating})`;
    };

    const getPriceLevel = (priceLevel) => {
        if (!priceLevel) return 'Price not available';
        return '$'.repeat(priceLevel);
    };

    if (currentCards.length === 0) {
        return (
            <div className="no-more-cards">
                <h3>No more places to show!</h3>
                <button onClick={onNewSuggestions} className="new-suggestions-btn">
                    Get New Suggestions
                </button>
            </div>
        );
    }

    return (
        <div className="swipe-container">
            <div className="cards-stack">
                {currentCards.map((place, index) => (
                    <TinderCard
                        key={place.place_id}
                        onSwipe={(dir) => handleSwipe(dir, place)}
                        preventSwipe={['up', 'down']}
                        className="swipe-card"
                        swipeRequirementType="position"
                        swipeThreshold={100}
                    >
                        <div className={`card ${index === 0 ? 'top-card' : ''}`}>
                            <div className="card-image">
                                {place.photos && place.photos.length > 0 ? (
                                    <img 
                                        src={place.photos[0]} 
                                        alt={place.name}
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/400/300';
                                        }}
                                    />
                                ) : (
                                    <div className="no-image">
                                        <span>📍</span>
                                        <p>No image available</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="card-content">
                                <h3 className="place-name">{place.name}</h3>
                                <p className="place-address">{place.address}</p>
                                
                                <div className="place-details">
                                    <div className="rating">
                                        {getRatingStars(place.rating)}
                                    </div>
                                    
                                    <div className="price-level">
                                        {getPriceLevel(place.price_level)}
                                    </div>
                                    
                                    <div className="opening-hours">
                                        {place.opening_hours !== undefined ? (
                                            <span className={place.opening_hours ? 'open' : 'closed'}>
                                                {place.opening_hours ? '🟢 Open' : '🔴 Closed'}
                                            </span>
                                        ) : (
                                            <span>Hours not available</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="place-types">
                                    {place.types && place.types.slice(0, 3).map((type, idx) => (
                                        <span key={idx} className="type-tag">
                                            {type.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TinderCard>
                ))}
            </div>
            
            <div className="swipe-buttons">
                <button 
                    className="swipe-btn dislike"
                    onClick={() => handleSwipe('left', currentCards[0])}
                    disabled={currentCards.length === 0}
                >
                    👎 Pass
                </button>
                <button 
                    className="swipe-btn like"
                    onClick={() => handleSwipe('right', currentCards[0])}
                    disabled={currentCards.length === 0}
                >
                    👍 Like
                </button>
            </div>
            
            <div className="swipe-instructions">
                <p>Swipe right to like, left to pass</p>
                <p>Places: {currentIndex + 1} of {places.length}</p>
            </div>
        </div>
    );
};

export default SwipeCards;