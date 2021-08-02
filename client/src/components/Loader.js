import React from 'react';
import 'materialize-css';

export const Loader = () => {
    return (
        <div className="overlay">
            <div className="overlay__inner">
                <div className="overlay__content">
                    <span className="spinner"></span>
                </div>
            </div>
        </div>
    )
}