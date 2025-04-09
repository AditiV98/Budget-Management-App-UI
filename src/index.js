import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './store';
import { Provider } from 'react-redux';
import { FilterProvider } from './components/FilterContext'; // Import FilterProvider

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <FilterProvider> {/* Wrap App with FilterProvider */}
                <App />
            </FilterProvider>
        </Provider>
    </React.StrictMode>
);

reportWebVitals();
