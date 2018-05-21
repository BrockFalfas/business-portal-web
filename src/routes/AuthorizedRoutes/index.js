import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';

import LandingPage from '~pages/LandingPage';
import Dashboard from '~pages/Dashboard';
import Payments from '~pages/Payments';

import Sidebar from './components/Sidebar';

import './AuthorizedRoutes.css';

export default class AuthorizedRoutes extends React.Component {
  render() {
    return (
      <Layout className="AuthorizedRoutes">
        <Sidebar />
        <Layout.Content className="AuthorizedRoutes-content">
          <Switch>
            <Route exact path="/landing" component={LandingPage} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/payments" component={Payments} />
            <Redirect from="*" to="/payments" />
          </Switch>
        </Layout.Content>
      </Layout>
    );
  }
}