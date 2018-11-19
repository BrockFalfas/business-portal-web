import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Table, Checkbox, Spin, Button, Tooltip, Radio } from 'antd';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import Box from '~components/Box';
import Header from '~components/Header';
import BottomBar from '~components/BottomBar';
import Summary from './components/Summary';

import { getCurrentTwoWeeksPeriod } from '~utils/time';
import { formatUsd } from '~utils/number';
import { JobsList } from './components/JobsList';
import makeDefaultPagination from '~utils/pagination';

import RefreshButton from '~components/RefreshButton';

import { AddTransactionModal } from '~pages/Payments/components/AddTransactionModal';

import './PaymentsList.scss';

const { Column } = Table;
const CheckboxGroup = Radio.Group;

class Payments extends React.Component {
  static propTypes = {
    isSummaryLoading: PropTypes.bool,
    isJobsLoading: PropTypes.bool,
    paymentsListPagination: PropTypes.object,
    usersJobs: PropTypes.array,
    selectedTransactionGroups: PropTypes.array,
    selectedTransactionsSummaryValue: PropTypes.number,
    selectedTransactionsIds: PropTypes.object,
    selectedContractorsIds: PropTypes.object,
    resetTransactions: PropTypes.bool,
  };

  state = {
    checked: false,
    previous: {
      total: 0,
      users: 0,
      startDate: '',
      endDate: '',
    },
    current: {
      total: 0,
      users: 0,
      startDate: '',
      endDate: '',
    },
    usersJobs: [],
    selectedTransactionsIds: new Set(),
    selectedContractorsIds: new Set(),
    selectedTransactionsSummaryValue: 0,
    pagination: makeDefaultPagination(),
    paymentsListPagination: null,
    selectedTransactionGroups: [],
    resetTransactions: false,
    isAddPaymentModalVisible: false,
    selectedUserId: '',
    selectedStatusFilters: [],
  };

  componentDidMount() {
    const { pagination, resetTransactions } = this.state;
    const { getTransactionsSummary, getUsersJobs, reset } = this.props;
    getTransactionsSummary({
      status: 'new',
      ...getCurrentTwoWeeksPeriod(),
    });
    getUsersJobs({
      ...getCurrentTwoWeeksPeriod(),
      page: pagination.current,
      limit: pagination.pageSize,
    });
    if (resetTransactions) {
      reset();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let localState = {};
    if (
      nextProps.transactionsSummary &&
      (nextProps.transactionsSummary.previous !== prevState.previous ||
        nextProps.transactionsSummary.current !== prevState.current)
    ) {
      const { previous, current } = nextProps.transactionsSummary;
      localState['previous'] = { ...previous };
      localState['current'] = { ...current };
    }

    if (nextProps.usersJobs !== prevState.usersJobs) {
      localState['usersJobs'] = nextProps.usersJobs;
    }

    if (nextProps.resetTransactions !== prevState.resetTransactions) {
      localState['resetTransactions'] = nextProps.resetTransactions;
    }

    if (nextProps.selectedContractorsIds.size !== prevState.selectedContractorsIds.size) {
      localState['selectedContractorsIds'] = nextProps.selectedContractorsIds;
    }

    if (nextProps.selectedTransactionsIds.size !== prevState.selectedTransactionsIds.size) {
      localState['selectedTransactionsIds'] = nextProps.selectedTransactionsIds;
    }

    if (nextProps.selectedTransactionGroups.length !== prevState.selectedTransactionGroups.length) {
      localState['selectedTransactionGroups'] = nextProps.selectedTransactionGroups;
    }

    if (nextProps.selectedTransactionsSummaryValue !== prevState.selectedTransactionsSummaryValue) {
      localState['selectedTransactionsSummaryValue'] = nextProps.selectedTransactionsSummaryValue;
    }

    if (nextProps.paymentsListPagination !== prevState.paymentsListPagination) {
      let pag = prevState.pagination;
      localState['paymentsListPagination'] = nextProps.paymentsListPagination;
      localState['pagination'] = {
        ...pag,
        total: nextProps.paymentsListPagination.total,
      };
    }
    return Object.keys(localState).length ? localState : null;
  }

  handleRefresh = () => {
    const { getUsersJobs, getTransactionsSummary } = this.props;
    const { pagination } = this.state;
    getTransactionsSummary({
      status: 'new',
      ...getCurrentTwoWeeksPeriod(),
    });
    getUsersJobs({
      ...getCurrentTwoWeeksPeriod(),
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  handleTableChange = (pag) => {
    const { getUsersJobs, getTransactionsSummary } = this.props;
    const { pagination } = this.state;
    let curr = pag.current;
    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }
    this.setState({ pagination: { ...pag, current: curr } });
    getTransactionsSummary({
      status: 'new',
      ...getCurrentTwoWeeksPeriod(),
    });
    getUsersJobs({
      ...getCurrentTwoWeeksPeriod(),
      page: curr,
      limit: pag.pageSize,
    });
  };

  render() {
    const {
      checked,
      previous,
      current,
      selectedTransactionsIds,
      usersJobs,
      selectedContractorsIds,
      selectedTransactionsSummaryValue,
      pagination,
    } = this.state;

    const { isSummaryLoading, isJobsLoading } = this.props;

    const options = [
      { label: 'New', value: 'new' },
      { label: 'Processed', value: 'processed' },
      { label: 'Failed', value: 'failed' },
    ];

    return (
      <div>
        <Header title="Payments List" size="medium">
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isJobsLoading} />
        </Header>

        <Spin spinning={isSummaryLoading}>
          <Summary previous={previous} current={current} />
        </Spin>

        <div className="PaymentsList-selector">
          <Checkbox onChange={this.onSelectAll} checked={checked} /> Approve all
        </div>

        <AddTransactionModal
          userId={this.state.selectedUserId}
          createTransaction={this.props.createTransaction}
          isModalVisible={this.state.isAddPaymentModalVisible}
          onChangeVisibility={this.onChangeVisibility}
          handleRefresh={this.handleRefresh}
        />

        <Box>
          <Table
            dataSource={usersJobs}
            className="PaymentsList-table"
            loading={isJobsLoading}
            pagination={pagination}
            onChange={this.handleTableChange}
            rowKey={record => record.id}
            expandedRowRender={record => <div>{this.renderJobsList(record)}</div>}>
            <Column
              align="center"
              dataIndex="rank"
              title="Rank"
              width="10%"
              className="PaymentsList-rank-selector"
            />
            <Column
              align="center"
              dataIndex="contractor"
              width="35%"
              title="Contractor"
              render={this.showContractorName}
              className="PaymentsList-contractor-selector"
            />
            <Column
              align="center"
              dataIndex="jobsCount"
              title="Jobs"
              width="10%"
              className="PaymentsList-numOfJobs-selector"
            />
            <Column
              align="center"
              className="PaymentsList-table-current PaymentsList-current-selector"
              dataIndex="total"
              render={this.renderAmount}
              width="15%"
              title="Current"
            />
            <Column
              align="center"
              title="Actions"
              width="15%"
              render={(text, record) => {
                return (
                  <Tooltip placement="top" title={'Add a payment'}>
                    <Button onClick={() => this.handleAddPaymentClick(record)}>
                      <Icon type="plus" theme="outlined" />
                    </Button>
                  </Tooltip>
                );
              }}
            />
            <Column
              className="PaymentsList-table-approve PaymentsList-approve-selector"
              title="Approve"
              align="center"
              width="15%"
              filterDropdown={({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div className={'ant-table-filter-dropdown'}>
                  <CheckboxGroup
                    options={options}
                    filterMultiple={false}
                    onChange={this.onFilterChanged}
                    value={this.state.selectedStatusFilters}
                    className={'payment-status-box'}
                  />
                  <div className="ant-table-filter-dropdown-btns">
                    <span
                      className="ant-table-filter-dropdown-link confirm PaymentsList--link"
                      onClick={e => this.handleFilterApply(e, confirm)}>
                      OK
                    </span>
                    <span
                      className="ant-table-filter-dropdown-link clear PaymentsList--link"
                      onClick={e => this.handleFilterApply(e, clearFilters)}>
                      Reset
                    </span>
                  </div>
                </div>
              )}
              render={(text, record) => this.renderStatusColumn(record)}
            />
          </Table>
        </Box>
        <BottomBar
          selectedTransactionsIds={selectedTransactionsIds}
          selectedContractorsIds={selectedContractorsIds}
          selectedTransactionsSummaryValue={selectedTransactionsSummaryValue}
          onSubmit={this.handlePay}
        />
      </div>
    );
  }

  onFilterChanged = e => {
    this.setState({ selectedStatusFilters: e.target.value });
  };

  handleFilterApply = (e, confirm) => {
    const { getUsersJobs, getTransactionsSummary } = this.props;
    const { pagination } = this.state;
    if (e.currentTarget.innerText === 'OK') {
      getTransactionsSummary({
        status: this.state.selectedStatusFilters,
        ...getCurrentTwoWeeksPeriod(),
      });
      getUsersJobs({
        ...getCurrentTwoWeeksPeriod(),
        page: pagination.current,
        limit: pagination.pageSize,
        status: this.state.selectedStatusFilters,
      });
      confirm();
    } else {
      this.setState({ selectedStatusFilters: [] });
      getTransactionsSummary({
        ...getCurrentTwoWeeksPeriod(),
      });
      getUsersJobs({
        ...getCurrentTwoWeeksPeriod(),
        page: pagination.current,
        limit: pagination.pageSize,
      });
      confirm();
    }
  };

  isActive = record => {
    const { selectedContractorsIds } = this.state;
    return selectedContractorsIds.has(record.id);
  };

  handleSelectTransaction = user => {
    const {
      selectedTransactionsIds,
      selectedContractorsIds,
      selectedTransactionGroups,
      usersJobs,
    } = this.state;
    const { updatePaymentsList } = this.props;

    let { selectedTransactionsSummaryValue } = this.state;
    const contractorId = user.id;
    let transactionIds = [];

    if (selectedContractorsIds.has(contractorId)) {
      selectedContractorsIds.delete(contractorId);
      user.jobs.forEach(job => {
        if (job.status === 'new') {
          transactionIds.push(job.id);
          selectedTransactionsSummaryValue -= parseFloat(job.total);
        }
      });
      for (let i = 0; i < selectedTransactionGroups.length; i++) {
        if (selectedTransactionGroups[i].userId === user.id) {
          selectedTransactionGroups.splice(i, 1);
          break;
        }
      }
    } else {
      selectedContractorsIds.add(contractorId);
      user.jobs.forEach(job => {
        if (job.status === 'new') {
          transactionIds.push(job.id);
          selectedTransactionsSummaryValue += parseFloat(job.total);
        }
      });
      selectedTransactionGroups.push({
        userId: user.id,
        transactionsIds: transactionIds,
      });
    }

    transactionIds.forEach(transaction => {
      if (selectedTransactionsIds.has(transaction)) {
        selectedTransactionsIds.delete(transaction);
      } else {
        selectedTransactionsIds.add(transaction);
      }
    });

    this.setState({
      checked: selectedTransactionsIds.size === usersJobs.length,
    });

    updatePaymentsList({
      selectedContractorsIds,
      selectedTransactionsIds,
      selectedTransactionsSummaryValue,
      selectedTransactionGroups,
    });
  };

  handleAddPaymentClick = record => {
    this.setState({
      selectedUserId: record.id,
      isAddPaymentModalVisible: true,
    });
  };

  renderStatusColumn = record => {
    let newTransactions = record.jobs.filter(entry => {
      return entry.status === 'new';
    });
    if (newTransactions.length > 0) {
      return (
        <button
          className={classnames(null, {
            active: this.isActive(record),
          })}
          onClick={() => this.handleSelectTransaction(record)}>
          <Icon type="check" />
        </button>
      );
    }
  };

  onChangeVisibility = (isAddPaymentModalVisible, refreshData = false) => {
    this.setState({ isAddPaymentModalVisible });
  };

  renderAmount = amount => formatUsd(amount);

  handleTypeChange = e => this.setState({ type: e.target.value });

  handlePay = () => {
    const { history, match } = this.props;
    history.push(`${match.url}/confirmation`);
  };

  onSelectAll = e => {
    const { usersJobs, updatePaymentsList } = this.props;
    let data = {
      selectedTransactionsSummaryValue: 0,
      selectedTransactionsIds: new Set(),
      selectedContractorsIds: new Set(),
      selectedTransactionGroups: [],
    };

    if (e.target.checked) {
      usersJobs.forEach(user => {
        let selected = false;
        user.jobs.forEach(job => {
          if (job.status === 'new') {
            data.selectedTransactionsIds.add(job.id);
            data.selectedTransactionsSummaryValue += parseFloat(job.total);
            selected = true;
          }
        });
        if (selected) {
          data.selectedContractorsIds.add(user.id);
          data.selectedTransactionGroups.push({
            userId: user.id,
            transactionsIds: user.transactionsIds,
          });
        }
      });
    }

    this.setState({ checked: e.target.checked });

    updatePaymentsList({ ...data });
  };

  showContractorName = (val, user) => {
    if (user.contractor === ' ') {
      return <div>Profile doesn't exist</div>;
    }

    return <Link to={'/contractors/' + user.id}>{user.contractor}</Link>;
  };

  renderJobsList = record => {
    return (
      <JobsList
        jobsList={record.jobs}
        userId={record.id}
        renderAmount={this.renderAmount}
        handleRefresh={this.handleRefresh}
        createTransaction={this.props.createTransaction}
      />
    );
  };
}

const mapStateToProps = state => ({
  transactionsSummary: state.transactions.transactionsSummary,
  paymentsListPagination: state.users.paymentsListPagination,
  usersJobs: state.users.usersJobs,
  selectedTransactionsIds: state.payments.selectedTransactionsIds,
  selectedContractorsIds: state.payments.selectedContractorsIds,
  selectedTransactionGroups: state.payments.selectedTransactionGroups,
  resetTransactions: state.payments.resetTransactions,
  selectedTransactionsSummaryValue: state.payments.selectedTransactionsSummaryValue,
  isSummaryLoading: state.loading.effects.transactions.getTransactionsSummary,
  isJobsLoading: state.loading.effects.users.getUsersJobs,
});

const mapDispatchToProps = dispatch => ({
  getUsersJobs: dispatch.users.getUsersJobs,
  updatePaymentsList: dispatch.payments.updatePaymentsList,
  getTransactionsSummary: dispatch.transactions.getTransactionsSummary,
  createTransaction: dispatch.transactions.createTransaction,
  reset: dispatch.payments.reset,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Payments);
