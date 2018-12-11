import React from 'react';

import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';

import Box from '~components/Box';

import './Jobs.scss';
import { Button, Icon, Modal, Table, Tooltip } from 'antd';

import RefreshButton from '~components/RefreshButton';
import Header from '~components/Header';
import makeDefaultPagination from '~utils/pagination';
import { formatUsd } from '~utils/number';

const { Column } = Table;

export class Jobs extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    jobsList: PropTypes.arrayOf(PropTypes.object),
    jobsListPagination: PropTypes.object,
  };
  state = {
    jobsList: [],
    pagination: makeDefaultPagination(),
    jobsListPagination: null,
  };

  componentDidMount() {
    this.handleRefresh();
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

  handleRefresh = () => {
    const { getJobs } = this.props;
    const { pagination } = this.state;
    getJobs({
      page: pagination.current,
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

  handleTableChange = pag => {
    const { getJobs } = this.props;
    const { pagination } = this.state;
    let curr = pag.current;
    if (pagination.pageSize !== pag.pageSize) {
      curr = 1;
    }
    this.setState({ pagination: { ...pag, current: curr } });
    getJobs({
      page: curr,
      limit: pag.pageSize,
    });
  };

  handleEdit = row => {
    console.log('edit', row);
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
    const { isLoading } = this.props;
    const { pagination, jobsList } = this.state;
    return (
      <div className="Jobs">
        <Header title="Jobs List" size="medium">
          <Button type="primary" onClick={this.handleAdd}>
            <Icon type="plus" theme="outlined" />
          </Button>
          <RefreshButton handleRefresh={this.handleRefresh} isLoading={isLoading} />
        </Header>
        <Box>
          <Table
            dataSource={jobsList}
            className="Jobs__table"
            rowKey="id"
            onChange={this.handleTableChange}
            pagination={pagination}
            loading={isLoading}>
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
            />
            <Column
              align="center"
              dataIndex="value"
              title="Value"
              render={text => {
                return <span className="Jobs__value">{this.renderAmount(text)}</span>;
              }}
            />
            <Column
              align="center"
              dataIndex="isActive"
              title="Active"
              render={text => {
                return (
                  <span>
                    {text ? (
                      <Icon className="Jobs__active" type="check-circle" theme="outlined" />
                    ) : (
                      <Icon className="Jobs__inactive" type="close-circle" theme="outlined" />
                    )}
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
                    {/*<Button onClick={() => this.handleEdit(record)}>*/}
                    {/*<Icon type="form" theme="outlined" />*/}
                    {/*</Button>*/}
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
  jobsList: state.jobs.jobsList,
  jobsListPagination: state.jobs.jobsListPagination,
  isLoading: state.loading.effects.jobs.getJobs,
});

const mapDispatchToProps = dispatch => ({
  getJobs: dispatch.jobs.getJobs,
  deleteJob: dispatch.jobs.deleteJob,
});

export default connect(mapStateToProps, mapDispatchToProps)(Jobs);
