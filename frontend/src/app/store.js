import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReduser.js';

const store = configureStore({
  reducer: rootReducer,
});

export default store;
