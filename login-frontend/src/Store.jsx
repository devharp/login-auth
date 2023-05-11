import React from 'react';
import { PAGES } from './constants';

export const StoreContext = React.createContext();


function reducer(state, action) {
    switch(action.title) {
      case PAGES.LOGIN.title:
        return PAGES.LOGIN;
      case PAGES.REGISTER.title:
          return PAGES.REGISTER;
      case PAGES.HOME.title:
        return PAGES.HOME;
      case PAGES.FORGOT_PASSWORD.title:
        return PAGES.FORGOT_PASSWORD;
      default:
        return null;
    }
  }

export function StoreProvider({ children }) {
    const [page, setPage] = React.useReducer(reducer, PAGES.LOGIN);
    return (
    <StoreContext.Provider value={{ page, setPage}}>
        { children }
    </StoreContext.Provider>
    )
}