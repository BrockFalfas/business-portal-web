import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Layout } from 'antd';

import ContractorPage from '~pages/Contractor';
import Topbar from '~components/Topbar';

import { Contractor } from '../RouteGuard';

import './ContractorRoutes.css';

export class ContractorRoutes extends React.Component {
  render() {
    return (
      <Layout className="ContractorRoutes">
        <Topbar className="ContractorRoutes-nav" type="contractor" />
        <Layout.Content className="ContractorRoutes-content">
          <Switch>
            <Route exact path="/contractor" component={Contractor(ContractorPage)} />
            <Redirect from="*" to="/contractor" />
          </Switch>
        </Layout.Content>
      </Layout>
    );
  }
}

export default ContractorRoutes;
