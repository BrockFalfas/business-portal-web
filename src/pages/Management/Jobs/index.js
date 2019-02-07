import React from 'react';
import { Icon, Modal, Table, Switch, Input, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import Box from '~components/Box';
import NotificationService from '~services/notification';
import TooltipButton from '~components/TooltipButton';
import RefreshButton from '~components/RefreshButton';
import Header from '~components/Header';
import makeDefaultPagination from '~utils/pagination';
import { formatUsd } from '~utils/number';
import './Jobs.scss';

const { Column } = Table;
const Search = Input.Search;

export class Jobs extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    statusIsLoading: PropTypes.bool,
    jobsList: PropTypes.arrayOf(PropTypes.object),
    jobsListPagination: PropTypes.object,
  };
  state = {
    jobsList: [],
    pagination: makeDefaultPagination(),
    jobsListPagination: null,
    searchName: null,
    sorters: {},
    filters: {},
  };

  componentDidMount() {
    const { pagination } = this.state;
    this.updateTable({
      current: pagination.current,
      limit: pagination.pageSize,
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.jobsList !== prevState.jobsList) {
      return {
        jobsList: nextProps.jobsList,
      };
    }
    if (nextProps.jobsListPagination !== prevState.jobsListPagination) {
      let pag = prevState.pagination;
      return {
        jobsListPagination: nextProps.jobsListPagination,
        pagination: { ...pag, total: nextProps.jobsListPagination.total },
      };
    }
    return null;
  }

  updateTable(config) {
    const { getJobs } = this.props;
    getJobs({
      page: config.current,
      limit: config.limit,
      orderBy: config.orderBy,
      order: config.order,
      name: config.searchName,
      isActive: config.searchIsActive,
      isCustom: false,
    });
  }

  handleRefresh = () => {
    const { pagination } = this.state;
    this.updateTable({
      current: pagination.current,
      limit: pagination.pageSize,
    });
  };

  handleAdd = () => {
    const { isLoading } = this.props;
    if (isLoading) {
    } else {
      this.props.history.push(`/management/jobs/add`);
    }
  };

  handleTableChange = (pag, filters, sorters) => {
    const { pagination, searchName } = this.state;
    let searchIsActive = undefined;
    let curr = pag.current;

    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }

    if (filters.isActive && filters.isActive.length > 0) {
      searchIsActive = filters.isActive[0] === 'true';
    }

    this.setState({ pagination: { ...pag, current: curr }, filters, sorters });

    this.updateTable({
      current: curr,
      limit: pag.pageSize,
      orderBy: sorters.columnKey || undefined,
      order: sorters.order || undefined,
      searchName: searchName || undefined,
      searchIsActive,
    });
  };

  handleSearch = (text, confirm) => {
    const { pagination, filters, sorters } = this.state;
    let searchIsActive = undefined;

    if (filters.isActive && filters.isActive.length > 0) {
      searchIsActive = filters.isActive[0] === 'true';
    }

    this.setState({ pagination: { ...pagination, current: 1 }, searchText: text });

    this.updateTable({
      current: 1,
      limit: pagination.pageSize,
      status: filters && filters.jobs ? filters.jobs[0] : undefined,
      orderBy: sorters.columnKey || undefined,
      order: sorters.order || undefined,
      searchName: text || undefined,
      searchIsActive,
    });
    confirm();
  };

  onSearch = e => {
    this.setState({ searchName: e.target.value });
  };

  clearSearch = clearFilters => {
    this.setState({ searchName: null });
    this.handleSearch(null, clearFilters);
  };

  handleEdit = row => {
    const { history } = this.props;
    history.push(`/management/jobs/${row.id}/edit`);
  };

  handleActive = async row => {
    const { changeJobStatus } = this.props;
    try {
      await changeJobStatus(row);
      NotificationService.open({
        type: 'success',
        message: 'Success',
        description: `Job: ${row.name} status successfully changed.`,
      });
      await this.handleRefresh();
    } catch (err) {
      NotificationService.open({
        type: 'error',
        message: 'Error',
        description: err.toString(),
      });
    }
  };

  handleDelete = async row => {
    const { deleteJob } = this.props;
    const { id, name } = row;
    Modal.confirm({
      title: `Are you sure you want to delete ${name}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        await deleteJob(id);
        return this.handleRefresh();
      },
    });
  };

  renderAmount = amount => formatUsd(amount);

  render() {
    const { isLoading, statusIsLoading } = this.props;
    const { pagination, jobsList, searchName } = this.state;
    return (
      <div className="Jobs">
        <Header title={`${jobsList.length} Jobs`} size="medium">
          <TooltipButton tooltip="Add job" type="primary" onClick={this.handleAdd}>
            <Icon type="plus" theme="outlined" />
          </TooltipButton>
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isLoading} />
        </Header>
        <Box>
          <Table
            dataSource={jobsList}
            className="Jobs__table"
            rowKey="id"
            onChange={this.handleTableChange}
            pagination={pagination}
            loading={isLoading || statusIsLoading}>
            <Column
              align="center"
              dataIndex="name"
              title="Name"
              render={(text, record) => {
                return (
                  <Tooltip title={record.description}>
                    <div className="Jobs__name">{text}</div>
                  </Tooltip>
                );
              }}
              filterDropdown={({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const prefix = searchName ? (
                  <Icon
                    type="close-circle"
                    key={'searchText'}
                    onClick={() => {
                      this.clearSearch(clearFilters);
                    }}
                  />
                ) : null;
                return (
                  <div className="Jobs__search-dropdown">
                    <Search
                      prefix={prefix}
                      className="Jobs__additional-box--search"
                      placeholder="Find Job"
                      onChange={this.onSearch}
                      value={searchName}
                      onSearch={value => this.handleSearch(value, confirm)}
                      enterButton
                    />
                  </div>
                );
              }}
              filterIcon={filtered => <Icon type="search" />}
            />
            <Column
              align="center"
              dataIndex="value"
              title="Amount"
              sorter={(a, b) => a.value.length - b.value.length}
              render={text => {
                return <span className="Jobs__value">{this.renderAmount(text)}</span>;
              }}
            />
            <Column
              align="center"
              dataIndex="isActive"
              title="Active"
              filters={[
                {
                  text: 'Active',
                  value: true,
                },
                {
                  text: 'Inactive',
                  value: false,
                },
              ]}
              filterMultiple={false}
              render={(text, record) => {
                return (
                  <span>
                    <Switch
                      checked={record.isActive}
                      onChange={() => this.handleActive(record)}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                    />
                  </span>
                );
              }}
            />
            <Column
              align="center"
              title="Actions"
              render={(text, record) => {
                return (
                  <span className="Jobs__table__buttons">
                    {/*<Button onClick={() => this.handleDelete(record)}>*/}
                    {/*<Icon type="delete" theme="outlined" />*/}
                    {/*</Button>*/}
                    <TooltipButton tooltip="Edit job" onClick={() => this.handleEdit(record)}>
                      <Icon type="form" theme="outlined" />
                    </TooltipButton>
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
  jobsList: state.jobs.jobsList,
  jobsListPagination: state.jobs.jobsListPagination,
  isLoading: state.loading.effects.jobs.getJobs,
  statusIsLoading: state.loading.effects.jobs.changeJobStatus,
});

const mapDispatchToProps = dispatch => ({
  getJobs: dispatch.jobs.getJobs,
  deleteJob: dispatch.jobs.deleteJob,
  changeJobStatus: dispatch.jobs.changeJobStatus,
});

export default connect(mapStateToProps, mapDispatchToProps)(Jobs);
