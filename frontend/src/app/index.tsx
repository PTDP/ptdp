/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import { GlobalStyle } from '../styles/global-styles';
import { NavBar } from 'app/components/NavBar';

import { HomePage } from './pages/HomePage/Loadable';
import { Resources } from './pages/Resources/Loadable';

import { Data } from './pages/Data/Loadable';
import { About } from './pages/About/Loadable';
import { NotFoundPage } from './pages/NotFoundPage/Loadable';
import { Methods } from './pages/Methods/Loadable';
import { useTranslation } from 'react-i18next';
import '../styles/tailwind.css';

export function App() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - #ConnectFamiliesNow Data Project"
        defaultTitle="#ConnectFamiliesNow Data Project"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content="#ConnectFamiliesNow Data Project" />
      </Helmet>
      <Switch>
        <Route exact path={process.env.PUBLIC_URL + '/about'} component={About} />
        <Route exact path={process.env.PUBLIC_URL + '/data'} component={Data} />
        <Route exact path={process.env.PUBLIC_URL + '/'} component={Data} />
        <Route exact path={process.env.PUBLIC_URL + '/resources'} component={Resources} />
        <Route exact path={process.env.PUBLIC_URL + '/methods'} component={Methods} />
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </BrowserRouter>
  );
}
