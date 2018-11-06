import React from 'react';

import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import Box from '~components/Box';

import './LinkedAccounts.scss';
import { Button, Icon, Modal, Table } from 'antd';

import RefreshButton from '~components/RefreshButton';
import Header from '~components/Header';
import makeDefaultPagination from '~utils/pagination';

const { Column } = Table;

export class LinkedAccounts extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    fundingSources: PropTypes.arrayOf(PropTypes.object),
    fundingSourcesPagination: PropTypes.object,
  };
  state = {
    fundingSources: [],
    pagination: makeDefaultPagination(),
    fundingSourcesPagination: null,
  };

  componentDidMount() {
    this.handleRefresh();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.fundingSources !== prevState.fundingSources) {
      return {
        fundingSources: nextProps.fundingSources,
      };
    }
    if (nextProps.fundingSourcesPagination !== prevState.fundingSourcesPagination) {
      let pag = prevState.pagination;
      return {
        fundingSourcesPagination: nextProps.fundingSourcesPagination,
        pagination: { ...pag, total: nextProps.fundingSourcesPagination.total },
      };
    }
    return null;
  }

  handleRefresh = () => {
    const { getFundingSource } = this.props;
    getFundingSource();
  };

  handleAdd = () => {
    const { isLoading } = this.props;
    if (isLoading) {
    } else {
      this.props.history.push(`/management/linked-accounts/add`);
    }
  };

  handleTableChange = pag => {
    const { getFundingSource } = this.props;
    const { pagination } = this.state;
    let curr = pag.current;
    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }
    this.setState({ pagination: { ...pag, current: curr } });
    getFundingSource();
  };

  handleDelete = async row => {
    const { deleteFundingSource } = this.props;
    const { name } = row;
    Modal.confirm({
      title: `Are you sure you want to delete ${name} funding source?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        await deleteFundingSource();
        return this.handleRefresh();
      },
    });
  };

  render() {
    const { isLoading } = this.props;
    const { pagination, fundingSources } = this.state;
    return (
      <div className="LinkedAccounts">
        <Header title="Linked Accounts List" size="medium">
          {fundingSources.length === 0 && (
            <Button type="primary" onClick={this.handleAdd}>
              <Icon type="plus" theme="outlined" />
            </Button>
          )}
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isLoading} />
        </Header>
        <Box>
          <Table
            dataSource={fundingSources}
            className="LinkedAccounts__table"
            rowKey="account"
            onChange={this.handleTableChange}
            pagination={pagination}
            loading={isLoading}>
            <Column align="left" dataIndex="name" title="Name" />
            <Column align="center" dataIndex="account" title="Account" />
            <Column align="center" dataIndex="routing" title="Routing" />
            <Column
              align="center"
              title="Actions"
              render={(text, record) => {
                return (
                  <span className="LinkedAccounts__table__buttons">
                    <Button onClick={() => this.handleDelete(record)}>
                      <Icon type="delete" theme="outlined" />
                    </Button>
                  </span>
                );
              }}
            />
          </Table>
        </Box>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  fundingSources: state.linkedAccounts.fundingSources,
  fundingSourcesPagination: state.linkedAccounts.fundingSourcesPagination,
  isLoading: state.loading.effects.linkedAccounts.getFundingSource,
});

const mapDispatchToProps = dispatch => ({
  getFundingSource: dispatch.linkedAccounts.getFundingSource,
  deleteFundingSource: dispatch.linkedAccounts.deleteFundingSource,
});

export default connect(mapStateToProps, mapDispatchToProps)(LinkedAccounts);
